import type { Chain } from '../../chains'
import type { PublicClient } from '../../clients'
import type { Data, Transaction } from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import {
  FetchBlockResponse,
  fetchBlock,
  watchBlockNumber,
  watchBlocks,
} from '../block'
import type { FetchTransactionResponse } from './fetchTransaction'
import { TransactionNotFoundError, fetchTransaction } from './fetchTransaction'
import type { FetchTransactionReceiptResponse } from './fetchTransactionReceipt'
import {
  TransactionReceiptNotFoundError,
  fetchTransactionReceipt,
} from './fetchTransactionReceipt'

export type OnProcessedData<TChain extends Chain = Chain> =
  FetchTransactionReceiptResponse<TChain>
export type OnProcessedCallback<TChain extends Chain = Chain> = (
  receipt: OnProcessedData<TChain>,
) => void

export type WatchTransactionArgs<TChain extends Chain = Chain> = {
  /** The hash of the transaction. */
  hash: Data
  onProcessed: OnProcessedCallback<TChain>
  /** Polling frequency (in ms). Defaults to the client's pollingInterval config. */
  pollingInterval?: number
}

export function watchTransaction<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  {
    hash,
    onProcessed,
    pollingInterval = client.pollingInterval,
  }: WatchTransactionArgs<TChain>,
) {
  const observerId = JSON.stringify(['watchTransaction', client.uid])

  let transaction: FetchTransactionResponse | undefined

  return observe(
    observerId,
    onProcessed,
  )(({ emit }) => {
    const unwatch = watchBlockNumber(
      client,
      async (blockNumber) => {
        try {
          // Fetch the transaction to check if it's been replaced.
          transaction = await fetchTransaction(client, { hash })

          // Fetch the receipt to check if it's been processed.
          const receipt = await fetchTransactionReceipt(client, { hash })

          // If the receipt is processed, stop polling & invoke callback.
          unwatch()
          emit(receipt)
          return
        } catch (err) {
          // If the receipt is not found, the transaction will be pending.
          // We need to check if it has potentially been replaced.
          if (
            transaction &&
            (err instanceof TransactionNotFoundError ||
              err instanceof TransactionReceiptNotFoundError)
          ) {
            // If the transaction has been mined, we were not replaced, continue polling.
            const isMined = transaction.blockNumber
            if (isMined) return

            // Let's retrieve the transactions from the current block.
            const block = await fetchBlock(client, {
              blockNumber,
              includeTransactions: true,
            })

            const replacedTransaction = (
              block.transactions as Transaction[]
            ).find(
              ({ from, nonce }) =>
                from === transaction?.from && nonce === transaction?.nonce,
            )

            // If we couldn't find a replaced transaction, continue polling.
            if (!replacedTransaction) return

            // If we found a replaced transaction, return it's receipt.
            const receipt = await fetchTransactionReceipt(client, {
              hash: replacedTransaction.hash,
            })
            unwatch()
            emit(receipt)
          }
        }
      },
      {
        emitOnBegin: true,
        pollingInterval,
      },
    )
    return unwatch
  })
}
