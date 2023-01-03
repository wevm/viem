import type { PublicClient } from '../../clients'
import type { Filter, Hash } from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import { createPendingTransactionFilter } from './createPendingTransactionFilter'
import { getFilterChanges } from './getFilterChanges'
import { uninstallFilter } from './uninstallFilter'

export type OnTransactionsResponse = Hash[]
export type OnTransactions = (transactions: OnTransactionsResponse) => void

export type WatchPendingTransactionsArgs = {
  /** Whether or not the transaction hashes should be batched on each invocation. */
  batch?: boolean
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** The callback to call when new transactions are received. */
  onTransactions: OnTransactions
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}

export function watchPendingTransactions(
  client: PublicClient,
  {
    batch = true,
    onError,
    onTransactions,
    pollingInterval = client.pollingInterval,
  }: WatchPendingTransactionsArgs,
) {
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
