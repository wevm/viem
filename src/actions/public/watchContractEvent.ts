import { Abi } from 'abitype'
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

export type OnLogsResponse = Log[]
export type OnLogs = (logs: OnLogsResponse) => void

export type WatchContractEventArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = any,
> = {
  /** The address of the contract. */
  address: Address | Address[]
  /** Contract ABI. */
  abi: TAbi
  /** Whether or not the event logs should be batched on each invocation. */
  batch?: boolean
  /** Contract event. */
  eventName?: ExtractEventNameFromAbi<TAbi, TEventName>
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** The callback to call when new event logs are received. */
  onLogs: OnLogs
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
} & ExtractEventArgsFromAbi<TAbi, TEventName>

export function watchContractEvent<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = any,
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
    let filter: Filter<'event'>

    const unwatch = poll(
      async () => {
        try {
          if (!filter) {
            try {
              filter = await createContractEventFilter(client, {
                abi,
                address,
                args,
                eventName,
              } as unknown as CreateContractEventFilterArgs)
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
