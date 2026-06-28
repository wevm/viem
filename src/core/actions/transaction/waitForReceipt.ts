import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { observe } from '../../internal/observe.js'
import {
  type WithRetryParameters,
  withResolvers,
  withRetry,
} from '../../internal/promise.js'
import { stringify } from '../../internal/stringify.js'
import { BlockNotFoundError, get as getBlock } from '../block/get.js'
import { watchNumber } from '../block/watchNumber.js'
import { TransactionNotFoundError, get as getTransaction } from './get.js'
import { TransactionReceiptNotFoundError, getReceipt } from './getReceipt.js'

/**
 * Waits for a transaction to be included on a block (one confirmation by
 * default), returning a watcher handle whose `receipt` promise resolves with
 * the transaction receipt.
 *
 * Register listeners with {@link waitForReceipt.Watcher.onReceipt} /
 * {@link waitForReceipt.Watcher.onReplaced} / {@link waitForReceipt.Watcher.onError},
 * or `await` the {@link waitForReceipt.Watcher.receipt} promise. Tear down early
 * via {@link waitForReceipt.Watcher.off}.
 *
 * Additionally supports replacement detection (e.g. sped-up or cancelled
 * transactions). A transaction is replaced when another transaction is sent
 * from the same `from` and `nonce`:
 *
 * - `repriced`: the gas price was modified (e.g. different `maxFeePerGas`).
 * - `cancelled`: the transaction was cancelled (e.g. self-send with `value` 0).
 * - `replaced`: the transaction payload was changed (e.g. different `value` or
 *   `data`).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { receipt } = Actions.transaction.waitForReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * await receipt
 * ```
 */
export function waitForReceipt<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: waitForReceipt.Options,
): waitForReceipt.Watcher<chain> {
  const {
    checkReplacement = true,
    confirmations = 1,
    hash,
    retryCount = 6,
    retryDelay = ({ count }) => ~~(1 << count) * 200, // exponential backoff
    timeout = 180_000,
  } = options

  const observerId = stringify(['waitForReceipt', client.uid, hash])

  const pollingInterval =
    options.pollingInterval ??
    client.chain?.preconfirmationTime ??
    client.pollingInterval

  type Receipt = waitForReceipt.Receipt<chain>
  type Transaction = getTransaction.ReturnType<chain>
  type Replacement = waitForReceipt.ReplacementReturnType<chain>

  let transaction: Transaction | undefined
  let replacedTransaction: Transaction | undefined
  let receipt: Receipt | undefined
  let retrying = false

  const receiptListeners = new Set<waitForReceipt.OnReceiptFn<chain>>()
  const replacedListeners = new Set<waitForReceipt.OnReplacedFn<chain>>()
  const errorListeners = new Set<waitForReceipt.OnErrorFn>()

  let settledReceipt: Receipt | undefined
  let settledError: Error | undefined
  let closed = false

  let unobserve: () => void

  const { promise, resolve, reject } = withResolvers<Receipt>()
  // Suppress unhandled rejection when the caller only consumes listeners and
  // never awaits `receipt`.
  promise.catch(() => {})

  const timer = timeout
    ? setTimeout(
        () => emitError(new WaitForReceiptTimeoutError({ hash })),
        timeout,
      )
    : undefined

  // Settles this handle with a receipt, fans out to its listeners, and removes
  // it from the shared observer (stopping the poll once the last handle
  // settles). The observer removal and `clearTimeout` ensure each handle
  // settles at most once.
  function emitReceipt(value: Receipt) {
    settledReceipt = value
    clearTimeout(timer)
    for (const listener of receiptListeners) listener(value)
    resolve(value)
    unobserve?.()
  }
  function emitError(error: Error) {
    settledError = error
    clearTimeout(timer)
    for (const listener of errorListeners) listener(error)
    reject(error)
    unobserve?.()
  }
  function emitReplaced(response: Replacement) {
    for (const listener of replacedListeners) listener(response)
  }

  const enoughConfirmations = (
    blockNumber: bigint,
    minedBlockNumber?: bigint,
  ) =>
    confirmations <= 1 ||
    (minedBlockNumber != null &&
      blockNumber - minedBlockNumber + 1n >= BigInt(confirmations))

  unobserve = observe(
    observerId,
    { onError: emitError, onReceipt: emitReceipt, onReplaced: emitReplaced },
    (emit) => {
      let watch: watchNumber.Watcher | undefined
      // Set when the observer is torn down (e.g. via `off`) before the async
      // setup below has created the watch, so it does not start a stray poll.
      let stopped = false

      void (async () => {
        // Resolve eagerly if the receipt is already available, so callers do
        // not wait for the next block when the transaction was already mined.
        receipt = await getReceipt(client, { hash }).catch(() => undefined)
        if (stopped) return
        if (receipt && confirmations <= 1) {
          emit.onReceipt(receipt)
          return
        }

        watch = watchNumber(client, {
          emitMissed: true,
          emitOnBegin: true,
          poll: true,
          pollingInterval,
        })
        watch.onBlockNumber(async (blockNumber_) => {
          if (retrying) return

          let blockNumber = blockNumber_

          try {
            // We already have a receipt: resolve once it has enough
            // confirmations against its own mined block.
            if (receipt) {
              if (!enoughConfirmations(blockNumber, receipt.blockNumber)) return
              emit.onReceipt(receipt)
              return
            }

            // Resolve the original transaction so we can detect replacements.
            // Some RPCs are slow to surface a freshly-mined transaction, so we
            // retry with backoff.
            if (checkReplacement && !transaction) {
              retrying = true
              await withRetry(
                async () => {
                  transaction = await getTransaction(client, { hash })
                  if (transaction.blockNumber)
                    blockNumber = transaction.blockNumber
                },
                { delay: retryDelay, retryCount },
              )
              retrying = false
            }

            receipt = await getReceipt(client, { hash })

            if (!enoughConfirmations(blockNumber, receipt.blockNumber)) return

            emit.onReceipt(receipt)
          } catch (err) {
            // The receipt is not found yet: the transaction is still pending,
            // or it has been replaced.
            if (
              err instanceof TransactionNotFoundError ||
              err instanceof TransactionReceiptNotFoundError
            ) {
              if (!transaction) {
                retrying = false
                return
              }

              try {
                replacedTransaction = transaction

                // Scan the candidate block for a transaction sharing the
                // original `from` + `nonce`. Retry on missing blocks (slow
                // sync).
                retrying = true
                const block = await withRetry(
                  () =>
                    getBlock(client, {
                      blockNumber,
                      includeTransactions: true,
                    }),
                  {
                    delay: retryDelay,
                    retryCount,
                    shouldRetry: ({ error }) =>
                      error instanceof BlockNotFoundError,
                  },
                )
                retrying = false

                const replacement = (
                  block.transactions as readonly Transaction[]
                ).find(
                  ({ from, hash: hash_, nonce }) =>
                    // Ignore the original transaction (slow-RPC race).
                    hash_ !== hash &&
                    from === replacedTransaction!.from &&
                    nonce === replacedTransaction!.nonce,
                )

                // No replacement found yet: keep polling.
                if (!replacement) return

                receipt = await getReceipt(client, { hash: replacement.hash })

                if (!enoughConfirmations(blockNumber, receipt.blockNumber))
                  return

                let reason: waitForReceipt.ReplacementReason = 'replaced'
                if (
                  replacement.to === replacedTransaction.to &&
                  replacement.value === replacedTransaction.value &&
                  replacement.input === replacedTransaction.input
                )
                  reason = 'repriced'
                else if (
                  replacement.from === replacement.to &&
                  replacement.value === 0n
                )
                  reason = 'cancelled'

                emit.onReplaced({
                  reason,
                  replacedTransaction: replacedTransaction!,
                  transaction: replacement,
                  transactionReceipt: receipt!,
                })
                emit.onReceipt(receipt!)
              } catch (err_) {
                emit.onError(err_ as Error)
              }
            } else {
              emit.onError(err as Error)
            }
          }
        })
      })()

      return () => {
        stopped = true
        watch?.off()
      }
    },
  )

  return {
    receipt: promise,
    onReceipt(fn) {
      if (settledReceipt) {
        fn(settledReceipt)
        return () => {}
      }
      if (closed || settledError) return () => {}
      receiptListeners.add(fn)
      return () => receiptListeners.delete(fn)
    },
    onReplaced(fn) {
      if (closed || settledReceipt || settledError) return () => {}
      replacedListeners.add(fn)
      return () => replacedListeners.delete(fn)
    },
    onError(fn) {
      if (settledError) {
        fn(settledError)
        return () => {}
      }
      if (closed || settledReceipt) return () => {}
      errorListeners.add(fn)
      return () => errorListeners.delete(fn)
    },
    off() {
      if (closed) return
      closed = true
      clearTimeout(timer)
      receiptListeners.clear()
      replacedListeners.clear()
      errorListeners.clear()
      unobserve?.()
    },
  }
}

export declare namespace waitForReceipt {
  type Receipt<chain extends Chain.Chain | undefined = undefined> =
    getReceipt.ReturnType<chain>

  type ReplacementReason = 'cancelled' | 'replaced' | 'repriced'

  type ReplacementReturnType<
    chain extends Chain.Chain | undefined = undefined,
  > = {
    /** Reason the transaction was replaced. */
    reason: ReplacementReason
    /** The transaction that was replaced. */
    replacedTransaction: getTransaction.ReturnType<chain>
    /** The replacement transaction. */
    transaction: getTransaction.ReturnType<chain>
    /** Receipt of the replacement transaction. */
    transactionReceipt: getReceipt.ReturnType<chain>
  }

  type OnReceiptFn<chain extends Chain.Chain | undefined = undefined> = (
    receipt: Receipt<chain>,
  ) => void

  type OnReplacedFn<chain extends Chain.Chain | undefined = undefined> = (
    response: ReplacementReturnType<chain>,
  ) => void

  type OnErrorFn = (error: Error) => void

  type Options = {
    /** Whether to check for transaction replacements. @default true */
    checkReplacement?: boolean | undefined
    /** Number of confirmations (blocks passed) to wait for. @default 1 */
    confirmations?: number | undefined
    /** Hash of the transaction. */
    hash: Hex.Hex
    /** Polling frequency (in ms). @default client.pollingInterval */
    pollingInterval?: number | undefined
    /** Number of times to retry if the transaction or block is not found. @default 6 */
    retryCount?: WithRetryParameters['retryCount'] | undefined
    /** Time to wait (in ms) between retries. @default exponential backoff */
    retryDelay?: WithRetryParameters['delay'] | undefined
    /** Optional timeout (in ms) before giving up. @default 180_000 */
    timeout?: number | undefined
  }

  type Watcher<chain extends Chain.Chain | undefined = undefined> = {
    /**
     * Resolves with the transaction receipt once it is confirmed, or rejects
     * if an error occurs or the timeout elapses. Remains pending if the watcher
     * is torn down via {@link off} before the receipt resolves.
     */
    receipt: Promise<Receipt<chain>>
    /**
     * Registers a listener invoked with the transaction receipt once confirmed.
     * Fires immediately if the receipt has already resolved. Returns a function
     * that unregisters the listener.
     */
    onReceipt: (fn: OnReceiptFn<chain>) => () => void
    /**
     * Registers a listener invoked when the transaction is replaced (repriced,
     * cancelled, or replaced). Returns a function that unregisters the listener.
     */
    onReplaced: (fn: OnReplacedFn<chain>) => () => void
    /**
     * Registers a listener invoked when waiting for the receipt fails. Fires
     * immediately if the watcher has already errored. Returns a function that
     * unregisters the listener.
     */
    onError: (fn: OnErrorFn) => () => void
    /**
     * Tears down the watcher: removes all listeners and stops the underlying
     * poll. Idempotent and terminal. If the receipt has not yet resolved,
     * {@link receipt} remains pending.
     */
    off: () => void
  }

  type ReturnType<chain extends Chain.Chain | undefined = undefined> =
    Watcher<chain>

  type ErrorType =
    | getBlock.ErrorType
    | getReceipt.ErrorType
    | getTransaction.ErrorType
    | watchNumber.ErrorType
    | WaitForReceiptTimeoutError
    | Errors.GlobalErrorType
}

/** Thrown when a transaction receipt was not found within the timeout. */
export class WaitForReceiptTimeoutError extends BaseError {
  override readonly name = 'Transaction.WaitForReceiptTimeoutError'

  constructor({ hash }: { hash: Hex.Hex }) {
    super(
      `Timed out while waiting for transaction with hash "${hash}" to be confirmed.`,
    )
  }
}
