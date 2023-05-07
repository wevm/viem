import type { Abi, Address, ExtractAbiEvent, Narrow } from 'abitype'

import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs, InferEventName } from '../../types/contract.js'
import type { Filter } from '../../types/filter.js'
import type { Log } from '../../types/log.js'
import {
  type GetAbiItemParameters,
  getAbiItem,
} from '../../utils/abi/getAbiItem.js'
import { observe } from '../../utils/observe.js'
import { poll } from '../../utils/poll.js'

import {
  type CreateContractEventFilterParameters,
  createContractEventFilter,
} from './createContractEventFilter.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getFilterChanges } from './getFilterChanges.js'
import { type GetLogsParameters, getLogs } from './getLogs.js'
import { uninstallFilter } from './uninstallFilter.js'

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
  args?: GetEventArgs<TAbi, TEventName>
  /** Whether or not the event logs should be batched on each invocation. */
  batch?: boolean
  /** Contract event. */
  eventName?: InferEventName<TAbi, TEventName>
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** The callback to call when new event logs are received. */
  onLogs: OnLogsFn<TAbi, TEventName>
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}

export type WatchContractEventReturnType = () => void

/**
 * Watches and returns emitted contract event logs.
 *
 * - Docs: https://viem.sh/docs/contract/watchContractEvent.html
 *
 * This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent.html#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent.html#onLogs).
 *
 * `watchContractEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchContractEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchContractEventParameters}
 * @returns A function that can be invoked to stop watching for new event logs. {@link WatchContractEventReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { watchContractEvent } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = watchContractEvent(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']),
 *   eventName: 'Transfer',
 *   args: { from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' },
 *   onLogs: (logs) => console.log(logs),
 * })
 */
export function watchContractEvent<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
>(
  client: PublicClient<Transport, TChain>,
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
