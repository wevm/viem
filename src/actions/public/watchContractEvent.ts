import type { Abi, ExtractAbiEvent, Narrow } from 'abitype'
import type { PublicClient } from '../../clients'
import type {
  Address,
  ExtractEventArgsFromAbi,
  ExtractEventNameFromAbi,
  Filter,
  Log,
} from '../../types'
import type { GetAbiItemParameters } from '../../utils'
import { getAbiItem } from '../../utils'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import {
  createContractEventFilter,
  CreateContractEventFilterParameters,
} from './createContractEventFilter'
import { getBlockNumber } from './getBlockNumber'
import { getFilterChanges } from './getFilterChanges'
import { getLogs, GetLogsParameters } from './getLogs'
import { uninstallFilter } from './uninstallFilter'

export type OnLogsParameter<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
> = TAbi extends Abi
  ? Log<bigint, number, ExtractAbiEvent<TAbi, TEventName>>[]
  : Log[]
export type OnLogsFn<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
> = (logs: OnLogsParameter<TAbi, TEventName>) => void

export type WatchContractEventParameters<
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
  onLogs: OnLogsFn<TAbi, TEventName>
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}

export type WatchContractEventReturnType = () => void

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
  }: WatchContractEventParameters<TAbi, TEventName>,
): WatchContractEventReturnType {
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
    let previousBlockNumber: bigint
    let filter: Filter<'event', TAbi, TEventName> | undefined
    let initialized = false

    const unwatch = poll(
      async () => {
        if (!initialized) {
          try {
            filter = (await createContractEventFilter(client, {
              abi,
              address,
              args,
              eventName,
            } as unknown as CreateContractEventFilterParameters)) as Filter<
              'event',
              TAbi,
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
                event: getAbiItem({
                  abi,
                  name: eventName,
                } as unknown as GetAbiItemParameters),
              } as unknown as GetLogsParameters)
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
