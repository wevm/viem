import { AbiEvent } from 'abitype'
import type { PublicClient } from '../../clients'
import type {
  Address,
  Filter,
  Log,
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
} from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import { createEventFilter, CreateEventFilterArgs } from './createEventFilter'
import { getFilterChanges } from './getFilterChanges'
import { uninstallFilter } from './uninstallFilter'

export type OnLogsResponse<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = Log<bigint, number, TAbiEvent, [TAbiEvent], TEventName>[]
export type OnLogs<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = (logs: OnLogsResponse<TAbiEvent, TEventName>) => void

export type WatchEventArgs<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = {
  /** The address of the contract. */
  address?: Address | Address[]
  /** Whether or not the event logs should be batched on each invocation. */
  batch?: boolean
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** The callback to call when new event logs are received. */
  onLogs: OnLogs<TAbiEvent, TEventName>
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
} & (
  | {
      event: TAbiEvent
      args?: MaybeExtractEventArgsFromAbi<[TAbiEvent], TEventName>
    }
  | {
      event?: never
      args?: never
    }
)

export function watchEvent<
  TAbiEvent extends AbiEvent | undefined,
  TEventName extends string | undefined,
>(
  client: PublicClient,
  {
    address,
    args,
    batch = true,
    event,
    onError,
    onLogs,
    pollingInterval = client.pollingInterval,
  }: WatchEventArgs<TAbiEvent>,
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
    let filter: Filter<'event', [TAbiEvent], TEventName, any>

    const unwatch = poll(
      async () => {
        try {
          if (!filter) {
            try {
              filter = (await createEventFilter(client, {
                address,
                args,
                event,
              } as CreateEventFilterArgs)) as unknown as Filter<
                'event',
                [TAbiEvent],
                TEventName
              >
              return
            } catch (err) {
              unwatch()
              throw err
            }
          }

          const logs = await getFilterChanges(client, { filter })
          if (logs.length === 0) return
          if (batch) emit.onLogs(logs as any)
          else logs.forEach((log) => emit.onLogs([log] as any))
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
