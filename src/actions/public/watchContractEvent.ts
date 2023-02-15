import { Abi, AbiEvent, ExtractAbiEvent, Narrow } from 'abitype'
import type { PublicClient } from '../../clients'
import type {
  Address,
  ExtractEventArgsFromAbi,
  ExtractEventNameFromAbi,
  Filter,
  Log,
} from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import {
  createContractEventFilter,
  CreateContractEventFilterArgs,
} from './createContractEventFilter'
import { getFilterChanges } from './getFilterChanges'
import { uninstallFilter } from './uninstallFilter'

export type OnLogsResponse<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
> = TAbi extends Abi
  ? Log<bigint, number, ExtractAbiEvent<TAbi, TEventName>>[]
  : Log[]
export type OnLogs<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
> = (logs: OnLogsResponse<TAbi, TEventName>) => void

export type WatchContractEventArgs<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
> = {
  /** The address of the contract. */
  address?: Address | Address[]
  /** Contract ABI. */
  abi: Narrow<TAbi>
  args?: ExtractEventArgsFromAbi<TAbi, TEventName>
  /** Whether or not the event logs should be batched on each invocation. */
  batch?: boolean
  /** Contract event. */
  eventName?: ExtractEventNameFromAbi<TAbi, TEventName>
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** The callback to call when new event logs are received. */
  onLogs: OnLogs<TAbi, TEventName>
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}

export function watchContractEvent<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
>(
  client: PublicClient,
  {
    abi,
    address,
    args,
    batch = true,
    eventName,
    onError,
    onLogs,
    pollingInterval = client.pollingInterval,
  }: WatchContractEventArgs<TAbi, TEventName>,
) {
  const observerId = JSON.stringify([
    'watchContractEvent',
    address,
    args,
    batch,
    client.uid,
    eventName,
    pollingInterval,
  ])

  return observe(observerId, { onLogs, onError }, (emit) => {
    let filter: Filter<'event', TAbi, TEventName>

    const unwatch = poll(
      async () => {
        try {
          if (!filter) {
            try {
              filter = (await createContractEventFilter(client, {
                abi,
                address,
                args,
                eventName,
              } as unknown as CreateContractEventFilterArgs)) as Filter<
                'event',
                TAbi,
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
