import type { AbiEvent } from 'abitype'
import type { PublicClient, Transport } from '../../clients/index.js'
import type {
  Address,
  Chain,
  Filter,
  Log,
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
} from '../../types/index.js'
import { observe } from '../../utils/observe.js'
import { poll } from '../../utils/poll.js'
import { createEventFilter } from './createEventFilter.js'
import type { CreateEventFilterParameters } from './createEventFilter.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getFilterChanges } from './getFilterChanges.js'
import { getLogs } from './getLogs.js'
import { uninstallFilter } from './uninstallFilter.js'

export type OnLogsParameter<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = Log<bigint, number, TAbiEvent, [TAbiEvent], TEventName>[]
export type OnLogsFn<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = (logs: OnLogsParameter<TAbiEvent, TEventName>) => void

export type WatchEventParameters<
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
  onLogs: OnLogsFn<TAbiEvent, TEventName>
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

export type WatchEventReturnType = () => void

export function watchEvent<
  TChain extends Chain | undefined,
  TAbiEvent extends AbiEvent | undefined,
  TEventName extends string | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    args,
    batch = true,
    event,
    onError,
    onLogs,
    pollingInterval = client.pollingInterval,
  }: WatchEventParameters<TAbiEvent>,
): WatchEventReturnType {
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
    let previousBlockNumber: bigint
    let filter: Filter<'event', [TAbiEvent], TEventName, any>
    let initialized = false

    const unwatch = poll(
      async () => {
        if (!initialized) {
          try {
            filter = (await createEventFilter(client, {
              address,
              args,
              event: event!,
            } as unknown as CreateEventFilterParameters)) as unknown as Filter<
              'event',
              [TAbiEvent],
              TEventName
            >
          } catch {}
          initialized = true
          return
        }

        try {
          let logs: Log[]
          if (filter) {
            logs = await getFilterChanges(client, { filter })
          } else {
            // If the filter doesn't exist, we will fall back to use `getLogs`.
            // The fall back exists because some RPC Providers do not support filters.

            // Fetch the block number to use for `getLogs`.
            const blockNumber = await getBlockNumber(client)

            // If the block number has changed, we will need to fetch the logs.
            // If the block number doesn't exist, we are yet to reach the first poll interval,
            // so do not emit any logs.
            if (previousBlockNumber && previousBlockNumber !== blockNumber) {
              logs = await getLogs(client, {
                address,
                args,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber,
                event: event!,
              })
            } else {
              logs = []
            }
            previousBlockNumber = blockNumber
          }

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
