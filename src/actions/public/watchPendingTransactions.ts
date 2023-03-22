import type { PublicClient, Transport } from '../../clients'
import type { Chain, Filter, Hash } from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import { createPendingTransactionFilter } from './createPendingTransactionFilter'
import { getFilterChanges } from './getFilterChanges'
import { uninstallFilter } from './uninstallFilter'

export type OnTransactionsParameter = Hash[]
export type OnTransactionsFn = (transactions: OnTransactionsParameter) => void

export type WatchPendingTransactionsParameters = {
  /** Whether or not the transaction hashes should be batched on each invocation. */
  batch?: boolean
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** The callback to call when new transactions are received. */
  onTransactions: OnTransactionsFn
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}

export type WatchPendingTransactionsReturnType = () => void

export function watchPendingTransactions<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  {
    batch = true,
    onError,
    onTransactions,
    pollingInterval = client.pollingInterval,
  }: WatchPendingTransactionsParameters,
): WatchPendingTransactionsReturnType {
  const observerId = JSON.stringify([
    'watchPendingTransactions',
    client.uid,
    batch,
    pollingInterval,
  ])

  return observe(observerId, { onTransactions, onError }, (emit) => {
    let filter: Filter<'transaction'>

    const unwatch = poll(
      async () => {
        try {
          if (!filter) {
            try {
              filter = await createPendingTransactionFilter(client)
              return
            } catch (err) {
              unwatch()
              throw err
            }
          }

          const hashes = await getFilterChanges(client, { filter })
          if (hashes.length === 0) return
          if (batch) emit.onTransactions(hashes)
          else hashes.forEach((hash) => emit.onTransactions([hash]))
        } catch (err) {
          emit.onError?.(err as Error)
        }
      },
      {
        emitOnBegin: true,
        interval: pollingInterval,
      },
    )

    return async () => {
      if (filter) await uninstallFilter(client, { filter })
      unwatch()
    }
  })
}
