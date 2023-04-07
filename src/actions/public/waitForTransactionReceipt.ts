import type { PublicClient, Transport } from '../../clients/index.js'
import {
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
} from '../../errors/index.js'
import type { Chain, Hash, Transaction } from '../../types/index.js'
import { observe } from '../../utils/observe.js'
import { getBlock, watchBlockNumber } from './index.js'

import type { GetTransactionReturnType } from './getTransaction.js'
import { getTransaction } from './getTransaction.js'
import type { GetTransactionReceiptReturnType } from './getTransactionReceipt.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

export type ReplacementReason = 'cancelled' | 'replaced' | 'repriced'
export type ReplacementReturnType<
  TChain extends Chain | undefined = Chain | undefined,
> = {
  reason: ReplacementReason
  replacedTransaction: Transaction
  transaction: Transaction
  transactionReceipt: GetTransactionReceiptReturnType<TChain>
}

export type WaitForTransactionReceiptReturnType<
  TChain extends Chain | undefined = Chain | undefined,
> = GetTransactionReceiptReturnType<TChain>

export type WaitForTransactionReceiptParameters<
  TChain extends Chain | undefined = Chain | undefined,
> = {
  /** The number of confirmations (blocks that have passed) to wait before resolving. */
  confirmations?: number
  /** The hash of the transaction. */
  hash: Hash
  onReplaced?: (response: ReplacementReturnType<TChain>) => void
  /** Polling frequency (in ms). Defaults to the client's pollingInterval config. */
  pollingInterval?: number
  /** Optional timeout (in milliseconds) to wait before stopping polling. */
  timeout?: number
}

export async function waitForTransactionReceipt<
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    confirmations = 1,
    hash,
    onReplaced,
    pollingInterval = client.pollingInterval,
    timeout,
  }: WaitForTransactionReceiptParameters<TChain>,
): Promise<WaitForTransactionReceiptReturnType<TChain>> {
  const observerId = JSON.stringify([
    'waitForTransactionReceipt',
    client.uid,
    hash,
  ])

  let transaction: GetTransactionReturnType<TChain> | undefined
  let replacedTransaction: GetTransactionReturnType<TChain> | undefined
  let receipt: GetTransactionReceiptReturnType<TChain>

  return new Promise((resolve, reject) => {
    if (timeout)
      setTimeout(
        () => reject(new WaitForTransactionReceiptTimeoutError({ hash })),
        timeout,
      )

    const _unobserve = observe(
      observerId,
      { onReplaced, resolve, reject },
      (emit) => {
        const unwatch = watchBlockNumber(client, {
          emitMissed: true,
          emitOnBegin: true,
          poll: true,
          pollingInterval,
          async onBlockNumber(blockNumber) {
            const done = async (fn: () => void) => {
              unwatch()
              fn()
              _unobserve()
            }

            try {
              // If we already have a valid receipt, let's check if we have enough
              // confirmations. If we do, then we can resolve.
              if (receipt) {
                if (blockNumber - receipt.blockNumber + 1n < confirmations)
                  return

                done(() => emit.resolve(receipt))
                return
              }

              // Get the transaction to check if it's been replaced.
              transaction = await getTransaction(client, { hash })

              // Get the receipt to check if it's been processed.
              receipt = await getTransactionReceipt(client, { hash })

              // Check if we have enough confirmations. If not, continue polling.
              if (blockNumber - receipt.blockNumber + 1n < confirmations) return

              done(() => emit.resolve(receipt))
            } catch (err) {
              // If the receipt is not found, the transaction will be pending.
              // We need to check if it has potentially been replaced.
              if (
                transaction &&
                (err instanceof TransactionNotFoundError ||
                  err instanceof TransactionReceiptNotFoundError)
              ) {
                replacedTransaction = transaction

                // Let's retrieve the transactions from the current block.
                const block = await getBlock(client, {
                  blockNumber,
                  includeTransactions: true,
                })

                const replacementTransaction = (
                  block.transactions as Transaction[]
                ).find(
                  ({ from, nonce }) =>
                    from === replacedTransaction!.from &&
                    nonce === replacedTransaction!.nonce,
                )

                // If we couldn't find a replacement transaction, continue polling.
                if (!replacementTransaction) return

                // If we found a replacement transaction, return it's receipt.
                receipt = await getTransactionReceipt(client, {
                  hash: replacementTransaction.hash,
                })

                // Check if we have enough confirmations. If not, continue polling.
                if (blockNumber - receipt.blockNumber + 1n < confirmations)
                  return

                let reason: ReplacementReason = 'replaced'
                if (
                  replacementTransaction.to === replacedTransaction.to &&
                  replacementTransaction.value === replacedTransaction.value
                ) {
                  reason = 'repriced'
                } else if (
                  replacementTransaction.from === replacementTransaction.to &&
                  replacementTransaction.value === 0n
                ) {
                  reason = 'cancelled'
                }

                done(() => {
                  emit.onReplaced?.({
                    reason,
                    replacedTransaction: replacedTransaction!,
                    transaction: replacementTransaction,
                    transactionReceipt: receipt,
                  })
                  emit.resolve(receipt)
                })
              } else {
                done(() => emit.reject(err))
              }
            }
          },
        })
        return unwatch
      },
    )
  })
}
