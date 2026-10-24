import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { BlockNotFoundError } from '../../errors/block.js'
import {
  MethodNotFoundRpcError,
  MethodNotSupportedRpcError,
} from '../../errors/rpc.js'
import {
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
  type WaitForTransactionReceiptTimeoutErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { Transaction } from '../../types/transaction.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import { getAction } from '../../utils/getAction.js'
import { type ObserveErrorType, observe } from '../../utils/observe.js'
import { withResolvers } from '../../utils/promise/withResolvers.js'
import {
  type WithRetryParameters,
  withRetry,
} from '../../utils/promise/withRetry.js'
import { stringify } from '../../utils/stringify.js'

import { type GetBlockErrorType, getBlock } from './getBlock.js'
import {
  type GetTransactionErrorType,
  type GetTransactionReturnType,
  getTransaction,
} from './getTransaction.js'
import {
  type GetTransactionReceiptErrorType,
  type GetTransactionReceiptReturnType,
  getTransactionReceipt,
} from './getTransactionReceipt.js'
import {
  type WatchBlockNumberErrorType,
  watchBlockNumber,
} from './watchBlockNumber.js'

export type ReplacementReason = 'cancelled' | 'replaced' | 'repriced'
export type ReplacementReturnType<
  chain extends Chain | undefined = Chain | undefined,
> = {
  reason: ReplacementReason
  replacedTransaction: Transaction
  transaction: Transaction
  transactionReceipt: GetTransactionReceiptReturnType<chain>
}

export type WaitForTransactionReceiptReturnType<
  chain extends Chain | undefined = Chain | undefined,
> = GetTransactionReceiptReturnType<chain>

export type WaitForTransactionReceiptParameters<
  chain extends Chain | undefined = Chain | undefined,
> = {
  /**
   * Whether to check for transaction replacements.
   * @default `client.chain?.supportsTransactionReplacementDetection ?? true`
   */
  checkReplacement?: boolean | undefined
  /**
   * The number of confirmations (blocks that have passed) to wait before resolving.
   * @default 1
   */
  confirmations?: number | undefined
  /** The hash of the transaction. */
  hash: Hash
  /** Optional callback to emit if the transaction has been replaced. */
  onReplaced?: ((response: ReplacementReturnType<chain>) => void) | undefined
  /**
   * Polling frequency (in ms). Defaults to the client's pollingInterval config.
   * @default client.pollingInterval
   */
  pollingInterval?: number | undefined
  /**
   * The sender and nonce of the transaction, and optionally the fields it was
   * sent with.
   *
   * A node can drop a replaced transaction before the wait first reads it, and
   * `hash` alone does not identify its sender and nonce. With them, the wait
   * looks up the transaction in its nonce slot (`eth_getTransactionBySenderAndNonce`).
   * Without that method, it scans each block from the one it starts on, which
   * misses a replacement mined earlier.
   *
   * `onReplaced` receives these fields, with `hash`, as `replacedTransaction`.
   * Ignored on chains with their own replacement keys (e.g. Tempo nonce lanes),
   * where a sender and nonce do not identify a nonce slot.
   */
  replacement?:
    | {
        /** The sender of the transaction. */
        from: Address
        /** The calldata of the transaction. Identifies a repriced replacement. */
        input?: Hex | undefined
        /** The nonce of the transaction. */
        nonce: number
        /** The recipient of the transaction. Identifies a repriced replacement. */
        to?: Address | null | undefined
        /** The value of the transaction (in wei). Identifies a repriced replacement. */
        value?: bigint | undefined
      }
    | undefined
  /**
   * Number of times to retry if the transaction or block is not found.
   * @default 6 (exponential backoff)
   */
  retryCount?: WithRetryParameters['retryCount'] | undefined
  /**
   * Time to wait (in ms) between retries.
   * @default `({ count }) => ~~(1 << count) * 200` (exponential backoff)
   */
  retryDelay?: WithRetryParameters['delay'] | undefined
  /**
   * Optional timeout (in milliseconds) to wait before stopping polling.
   * @default 180_000
   */
  timeout?: number | undefined
}

export type WaitForTransactionReceiptErrorType =
  | ObserveErrorType
  | GetBlockErrorType
  | GetTransactionErrorType
  | GetTransactionReceiptErrorType
  | WatchBlockNumberErrorType
  | WaitForTransactionReceiptTimeoutErrorType
  | ErrorType

/**
 * Waits for the [Transaction](https://viem.sh/docs/glossary/terms#transaction) to be included on a [Block](https://viem.sh/docs/glossary/terms#block) (one confirmation), and then returns the [Transaction Receipt](https://viem.sh/docs/glossary/terms#transaction-receipt).
 *
 * - Docs: https://viem.sh/docs/actions/public/waitForTransactionReceipt
 * - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions
 * - JSON-RPC Methods:
 *   - Polls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt) on each block until it has been processed.
 *   - If a Transaction has been replaced:
 *     - Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) and extracts the transactions
 *     - Checks if one of the Transactions is a replacement
 *     - If so, calls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt).
 *   - If the Transaction is not found and `replacement` is provided:
 *     - Calls `eth_getTransactionBySenderAndNonce` to find the Transaction in its nonce slot
 *     - If it is a replacement, calls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt).
 *
 * The `waitForTransactionReceipt` action additionally supports Replacement detection (e.g. sped up Transactions).
 *
 * Transactions can be replaced when a user modifies their transaction in their wallet (to speed up or cancel). Transactions are replaced when they are sent from the same nonce.
 *
 * There are 3 types of Transaction Replacement reasons:
 *
 * - `repriced`: The gas price has been modified (e.g. different `maxFeePerGas`)
 * - `cancelled`: The Transaction has been cancelled (e.g. `value === 0n`)
 * - `replaced`: The Transaction has been replaced (e.g. different `value` or `data`)
 *
 * @param client - Client to use
 * @param parameters - {@link WaitForTransactionReceiptParameters}
 * @returns The transaction receipt. {@link WaitForTransactionReceiptReturnType}
 *
 * @example
 * import { createPublicClient, waitForTransactionReceipt, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const transactionReceipt = await waitForTransactionReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
export async function waitForTransactionReceipt<
  chain extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  parameters: WaitForTransactionReceiptParameters<chain>,
): Promise<WaitForTransactionReceiptReturnType<chain>> {
  const {
    checkReplacement = client.chain?.supportsTransactionReplacementDetection ??
      true,
    confirmations = 1,
    hash,
    onReplaced,
    retryCount = 6,
    retryDelay = ({ count }) => ~~(1 << count) * 200, // exponential backoff
    timeout = 180_000,
  } = parameters

  // On chains with their own replacement keys, a sender and nonce do not
  // identify a nonce slot.
  const replacement = client.chain?.transactionReplacement?.getKey
    ? undefined
    : parameters.replacement

  const getReplacementKey = (transaction: Transaction) =>
    client.chain?.transactionReplacement?.getKey?.(transaction) ??
    String(transaction.nonce)

  const pollingInterval = (() => {
    if (parameters.pollingInterval) return parameters.pollingInterval
    if (client.chain?.experimental_preconfirmationTime)
      return client.chain.experimental_preconfirmationTime
    return client.pollingInterval
  })()

  const observerId = stringify([
    'waitForTransactionReceipt',
    client.uid,
    hash,
    // Concurrent calls with different behavior-defining options must not
    // share an observer: the first call's polling closure decides timeout,
    // confirmations, polling interval and replacement checks for everyone.
    {
      checkReplacement,
      confirmations,
      pollingInterval,
      replacement,
      retryCount,
      timeout,
    },
  ])

  let transaction: GetTransactionReturnType<chain> | undefined
  let receipt: GetTransactionReceiptReturnType<chain> | undefined
  // A found replacement, kept while `receipt` waits for confirmations.
  let replacementResponse: ReplacementReturnType<chain> | undefined
  let retrying = false

  let _unobserve: () => void
  let _unwatch: () => void

  const { promise, resolve, reject } =
    withResolvers<WaitForTransactionReceiptReturnType<chain>>()

  const timer = timeout
    ? setTimeout(() => {
        _unwatch?.()
        _unobserve?.()
        reject(new WaitForTransactionReceiptTimeoutError({ hash }))
      }, timeout)
    : undefined

  _unobserve = observe(
    observerId,
    { onReplaced, resolve, reject },
    async (emit) => {
      receipt = await getAction(
        client,
        getTransactionReceipt,
        'getTransactionReceipt',
      )({ hash }).catch(() => undefined)

      if (receipt && confirmations <= 1) {
        clearTimeout(timer)
        emit.resolve(receipt)
        _unobserve?.()
        return
      }

      _unwatch = getAction(
        client,
        watchBlockNumber,
        'watchBlockNumber',
      )({
        emitMissed: true,
        emitOnBegin: true,
        poll: true,
        pollingInterval,
        async onBlockNumber(blockNumber_) {
          const done = (fn: () => void) => {
            clearTimeout(timer)
            _unwatch?.()
            fn()
            _unobserve?.()
          }

          let blockNumber = blockNumber_

          if (retrying) return

          try {
            // If we already have a valid receipt, let's check if we have enough
            // confirmations. If we do, then we can resolve.
            if (receipt) {
              if (
                confirmations > 1 &&
                (!receipt.blockNumber ||
                  blockNumber - receipt.blockNumber + 1n < confirmations)
              )
                return

              done(() => {
                if (replacementResponse) emit.onReplaced?.(replacementResponse)
                emit.resolve(receipt!)
              })
              return
            }

            // Get the transaction to check if it's been replaced.
            // We need to retry as some RPC Providers may be slow to sync
            // up mined transactions.
            if (checkReplacement && !transaction) {
              retrying = true
              await withRetry(
                async () => {
                  transaction = (await getAction(
                    client,
                    getTransaction,
                    'getTransaction',
                  )({ hash })) as GetTransactionReturnType<chain>
                  if (transaction.blockNumber)
                    blockNumber = transaction.blockNumber
                },
                {
                  delay: retryDelay,
                  retryCount,
                  // A dropped transaction does not reappear, so a known
                  // sender and nonce are looked up without the retries.
                  shouldRetry: ({ error }) =>
                    !(replacement && error instanceof TransactionNotFoundError),
                },
              )
              retrying = false
            }

            // Get the receipt to check if it's been processed.
            receipt = await getAction(
              client,
              getTransactionReceipt,
              'getTransactionReceipt',
            )({ hash })

            // Check if we have enough confirmations. If not, continue polling.
            if (
              confirmations > 1 &&
              (!receipt.blockNumber ||
                blockNumber - receipt.blockNumber + 1n < confirmations)
            )
              return

            done(() => emit.resolve(receipt!))
          } catch (err) {
            // If the receipt is not found, the transaction will be pending.
            // We need to check if it has potentially been replaced.
            if (
              err instanceof TransactionNotFoundError ||
              err instanceof TransactionReceiptNotFoundError
            ) {
              retrying = false

              // A node that dropped the transaction no longer returns it, so
              // the known fields of it stand in. RPC hashes are lowercase.
              const replaced =
                transaction ??
                (checkReplacement && replacement
                  ? ({
                      ...replacement,
                      hash: hash.toLowerCase(),
                    } as GetTransactionReturnType<chain>)
                  : undefined)
              if (!replaced) return

              // The transaction was seen mined, so it consumed its nonce slot
              // and was not replaced: its receipt is not indexed yet. The
              // transaction is fetched once, so one first seen pending is
              // matched by replacement key instead.
              if (replaced.blockNumber) return

              try {
                // Look up the transaction in the nonce slot, since the block
                // scan below misses a replacement mined before the wait starts.
                if (!transaction) {
                  retrying = true
                  const found = (await getAction(
                    client,
                    getTransaction,
                    'getTransaction',
                  )({
                    nonce: replaced.nonce,
                    sender: replaced.from,
                  }).catch((error) => {
                    // Without the method, only the block scan runs from now
                    // on. Other errors retry the lookup on the next block.
                    if (
                      error instanceof MethodNotFoundRpcError ||
                      error instanceof MethodNotSupportedRpcError
                    )
                      transaction = replaced
                    return undefined
                  })) as GetTransactionReturnType<chain> | undefined
                  retrying = false

                  // The transaction still holds its nonce slot.
                  if (
                    (found as Transaction | undefined)?.hash.toLowerCase() ===
                    replaced.hash
                  ) {
                    transaction = found
                    return
                  }

                  // Another transaction holds the nonce slot, so it replaced
                  // this one. A pending replacement has no receipt yet.
                  if (found) {
                    const replacementReceipt = await getAction(
                      client,
                      getTransactionReceipt,
                      'getTransactionReceipt',
                    )({ hash: found.hash }).catch((error) => {
                      if (error instanceof TransactionReceiptNotFoundError)
                        return undefined
                      throw error
                    })
                    if (!replacementReceipt) return

                    receipt = replacementReceipt
                    replacementResponse = {
                      reason:
                        client.chain?.transactionReplacement?.getReason?.({
                          replaced,
                          replacement: found,
                        }) ??
                        getReplacementReason(
                          replaced as Transaction,
                          found as Transaction,
                        ),
                      replacedTransaction: replaced as Transaction,
                      transaction: found as Transaction,
                      transactionReceipt: receipt,
                    }

                    // Check if we have enough confirmations. If not, continue polling.
                    if (
                      confirmations > 1 &&
                      (!receipt.blockNumber ||
                        blockNumber - receipt.blockNumber + 1n < confirmations)
                    )
                      return

                    done(() => {
                      emit.onReplaced?.(replacementResponse!)
                      emit.resolve(receipt!)
                    })
                    return
                  }
                }

                // Let's retrieve the transactions from the current block.
                // We need to retry as some RPC Providers may be slow to sync
                // up mined blocks.
                retrying = true
                const block = await withRetry(
                  () =>
                    getAction(
                      client,
                      getBlock,
                      'getBlock',
                    )({
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

                const replacedKey = getReplacementKey(replaced as Transaction)
                const replacementTransaction = (
                  block.transactions as {} as Transaction[]
                ).find(
                  (candidate) =>
                    isAddressEqual(candidate.from, replaced.from) &&
                    candidate.hash !== replaced.hash &&
                    getReplacementKey(candidate) === replacedKey,
                )

                // If we couldn't find a replacement transaction, continue polling.
                if (!replacementTransaction) return

                // If we found a replacement transaction, return it's receipt.
                receipt = await getAction(
                  client,
                  getTransactionReceipt,
                  'getTransactionReceipt',
                )({
                  hash: replacementTransaction.hash,
                })
                replacementResponse = {
                  reason:
                    client.chain?.transactionReplacement?.getReason?.({
                      replaced,
                      replacement: replacementTransaction,
                    }) ??
                    getReplacementReason(
                      replaced as Transaction,
                      replacementTransaction,
                    ),
                  replacedTransaction: replaced as Transaction,
                  transaction: replacementTransaction,
                  transactionReceipt: receipt,
                }

                // Check if we have enough confirmations. If not, continue polling.
                if (
                  confirmations > 1 &&
                  (!receipt.blockNumber ||
                    blockNumber - receipt.blockNumber + 1n < confirmations)
                )
                  return

                done(() => {
                  emit.onReplaced?.(replacementResponse!)
                  emit.resolve(receipt!)
                })
              } catch (err_) {
                done(() => emit.reject(err_))
              }
            } else {
              done(() => emit.reject(err))
            }
          }
        },
      })
    },
  )

  // Remove this caller's listener once its promise settles. `done` only
  // unobserves the caller that started the polling, so a listener from a
  // concurrent caller with the same options would otherwise stay cached: a
  // later wait for the same hash would join it, see an existing observer and
  // never start polling again. The timer is cleared here as well, since a
  // caller that resolves through another caller's poll never reaches `done`.
  return promise.finally(() => {
    clearTimeout(timer)
    _unobserve?.()
  })
}

function getReplacementReason(
  replaced: Transaction,
  replacement: Transaction,
): ReplacementReason {
  if (
    (replacement.to && replaced.to
      ? isAddressEqual(replacement.to, replaced.to)
      : replacement.to === replaced.to) &&
    replacement.value === replaced.value &&
    replacement.input === replaced.input
  )
    return 'repriced'
  if (replacement.from === replacement.to && replacement.value === 0n)
    return 'cancelled'
  return 'replaced'
}
