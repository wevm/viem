import type { Errors, Hex } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { isAbortError } from '../../internal/errors.js'
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
    checkReplacement = client.chain?.supportsTransactionReplacementDetection ??
      true,
    confirmations = 1,
    hash,
    retryCount = 6,
    retryDelay = ({ count }) => ~~(1 << count) * 200, // exponential backoff
    timeout = 180_000,
  } = options

  const pollingInterval =
    options.pollingInterval ??
    client.chain?.preconfirmationTime ??
    client.pollingInterval

  // Waits only share a poll when their behavior options match, so concurrent
  // waits with e.g. different `confirmations` settle independently.
  const observerId = stringify([
    'waitForReceipt',
    client.uid,
    checkReplacement,
    confirmations,
    hash,
    pollingInterval,
    retryCount,
    // JSON serializes functions to null; key on source text so distinct
    // function delays get distinct observers.
    typeof retryDelay === 'function' ? retryDelay.toString() : retryDelay,
  ])

  type Receipt = waitForReceipt.Receipt<chain>
  type Transaction = getTransaction.ReturnType<chain>
  type Replacement = waitForReceipt.ReplacementReturnType<chain>

  let transaction: Transaction | undefined
  let replacedTransaction: Transaction | undefined
  let receipt: Receipt | undefined

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

  unobserve = observe(
    observerId,
    { onError: emitError, onReceipt: emitReceipt, onReplaced: emitReplaced },
    (emit) => {
      let watch: watchNumber.Watcher | undefined
      // Set when the observer is torn down (e.g. via `off`) before the async
      // setup below has created the watch, so it does not start a stray poll.
      let stopped = false
      // Cancels in-flight retry backoffs on teardown.
      const aborter = new AbortController()

      // Candidate block numbers queue in order and drain one at a time, so a
      // slow lookup defers ticks instead of dropping them.
      const queue: bigint[] = []
      let queued: bigint | undefined
      let head: bigint | undefined
      let draining = false

      // Confirms against the latest observed head, so confirmations accrued
      // while a lookup was in flight still count.
      function confirmed(minedBlockNumber: bigint | undefined) {
        if (confirmations <= 1) return true
        if (minedBlockNumber == null) return false
        const blockNumber =
          head != null && head > minedBlockNumber ? head : minedBlockNumber
        return blockNumber - minedBlockNumber + 1n >= BigInt(confirmations)
      }

      async function process(blockNumber: bigint) {
        try {
          if (!receipt) {
            // The node may surface a slow transaction after startup.
            if (checkReplacement && !transaction)
              transaction = await getTransaction(client, { hash })
            receipt = await getReceipt(client, { hash })
          }
          if (!confirmed(receipt.blockNumber)) return
          emit.onReceipt(receipt)
        } catch (err) {
          // The receipt is not found yet: the transaction is still pending,
          // or it has been replaced.
          if (
            err instanceof TransactionNotFoundError ||
            err instanceof TransactionReceiptNotFoundError
          ) {
            if (!transaction) return

            try {
              replacedTransaction = transaction

              // Scan the candidate block for a transaction sharing the
              // original `from` + `nonce`. Retry on missing blocks (slow
              // sync).
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
                  signal: aborter.signal,
                },
              )

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

              if (!confirmed(receipt.blockNumber)) return

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
              if (isAbortError(err_)) return
              emit.onError(err_ as Error)
            }
          } else {
            emit.onError(err as Error)
          }
        }
      }

      async function drain() {
        if (draining) return
        draining = true
        try {
          while (queue.length > 0 && !stopped) await process(queue.shift()!)
        } finally {
          draining = false
        }
      }

      void (async () => {
        // Look up the receipt eagerly, so callers do not wait for the next
        // block when the transaction was already mined. Resolve the original
        // transaction alongside it, so a replacement is detectable even when
        // the original leaves the pool before the first tick; some RPCs are
        // slow to surface a fresh transaction, so retry with backoff.
        let eagerError: Error | undefined
        await Promise.all([
          (async () => {
            receipt = await getReceipt(client, { hash }).catch(() => undefined)
          })(),
          (async () => {
            if (!checkReplacement) return
            try {
              transaction = await withRetry(
                () => getTransaction(client, { hash }),
                { delay: retryDelay, retryCount, signal: aborter.signal },
              )
            } catch (err) {
              // Not found: the transaction may surface later; ticks retry.
              if (err instanceof TransactionNotFoundError) return
              if (isAbortError(err)) return
              eagerError = err as Error
            }
          })(),
        ])
        if (stopped) return
        if (receipt && confirmed(receipt.blockNumber)) {
          emit.onReceipt(receipt)
          return
        }
        if (eagerError && !receipt) {
          emit.onError(eagerError)
          return
        }

        watch = watchNumber(client, {
          emitMissed: true,
          emitOnBegin: true,
          poll: true,
          pollingInterval,
        })
        watch.onBlockNumber((blockNumber, prevBlockNumber) => {
          if (head == null || blockNumber > head) head = blockNumber
          // Queue each candidate block once: from the first observed head on
          // a fresh poll, or just after the previous head when joining an
          // already-running shared poll.
          const floor = queued ?? prevBlockNumber ?? blockNumber - 1n
          for (let n = floor + 1n; n <= blockNumber; n++) queue.push(n)
          if (queued == null || blockNumber > queued) queued = blockNumber
          void drain()
        })
      })()

      return () => {
        stopped = true
        aborter.abort()
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
    /** Whether to check for transaction replacements. @default client.chain?.supportsTransactionReplacementDetection ?? true */
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
