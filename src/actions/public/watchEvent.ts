import type { PublicClient } from '../../clients'
import type { Address, EventDefinition, Filter, Log } from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import { createEventFilter, EventFilterArgs } from './createEventFilter'
import { getFilterChanges } from './getFilterChanges'
import { uninstallFilter } from './uninstallFilter'

export type OnLogsResponse = Log[]
export type OnLogs = (logs: OnLogsResponse) => void

export type WatchEventArgs<TEventDefinition extends EventDefinition> = {
  /** The address of the contract. */
  address?: Address | Address[]
  /** Whether or not the event logs should be batched on each invocation. */
  batch?: boolean
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** The callback to call when new event logs are received. */
  onLogs: OnLogs
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
} & (
  | {
      event: TEventDefinition
      args?: EventFilterArgs<TEventDefinition>
    }
  | {
      event?: never
      args?: never
    }
)

export function watchEvent<TEventDefinition extends EventDefinition>(
  client: PublicClient,
  {
    address,
    args,
    batch = true,
    event,
    onError,
    onLogs,
    pollingInterval = client.pollingInterval,
  }: WatchEventArgs<TEventDefinition>,
) {
  const observerId = JSON.stringify([
    'watchEvent',
    address,
    args,
    batch,
    client.uid,
    event,
    pollingInterval,
  ])

  return observe(observerId, { onLogs, onError }, (emit) => {
    let filter: Filter<'event'>

    const unwatch = poll(
      async () => {
        try {
          if (!filter) {
            try {
              filter = await createEventFilter(client, {
                address,
                args,
                event: event!,
              })
              return
            } catch (err) {
              unwatch()
              throw err
            }
          }

          const logs = await getFilterChanges(client, { filter })
          if (logs.length === 0) return
          if (batch) emit.onLogs(logs)
          else logs.forEach((log) => emit.onLogs([log]))
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
