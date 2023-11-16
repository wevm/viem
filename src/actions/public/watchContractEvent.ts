import type { Abi, Address, ExtractAbiEvent } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs, InferEventName } from '../../types/contract.js'
import type { Filter } from '../../types/filter.js'
import type { Log } from '../../types/log.js'
import type { GetTransportConfig } from '../../types/transport.js'

import { type ObserveErrorType, observe } from '../../utils/observe.js'
import { poll } from '../../utils/poll.js'
import { type StringifyErrorType, stringify } from '../../utils/stringify.js'

import {
  DecodeLogDataMismatch,
  DecodeLogTopicsMismatch,
} from '../../errors/abi.js'
import { InvalidInputRpcError } from '../../errors/rpc.js'
import type { ErrorType } from '../../errors/utils.js'
import type { LogTopic } from '../../types/misc.js'
import { decodeEventLog } from '../../utils/abi/decodeEventLog.js'
import {
  type EncodeEventTopicsParameters,
  encodeEventTopics,
} from '../../utils/abi/encodeEventTopics.js'
import { formatLog } from '../../utils/formatters/log.js'
import { getAction } from '../../utils/getAction.js'
import {
  type CreateContractEventFilterParameters,
  createContractEventFilter,
} from './createContractEventFilter.js'
import { getBlockNumber } from './getBlockNumber.js'
import {
  type GetContractEventsParameters,
  getContractEvents,
} from './getContractEvents.js'
import { getFilterChanges } from './getFilterChanges.js'
import { uninstallFilter } from './uninstallFilter.js'

type PollOptions = {
  /**
   * Whether or not the transaction hashes should be batched on each invocation.
   * @default true
   */
  batch?: boolean
  /**
   * Polling frequency (in ms). Defaults to Client's pollingInterval config.
   * @default client.pollingInterval
   */
  pollingInterval?: number
}

export type WatchContractEventOnLogsParameter<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
  TStrict extends boolean | undefined = undefined,
> = TAbi extends Abi
  ? Log<bigint, number, false, ExtractAbiEvent<TAbi, TEventName>, TStrict>[]
  : Log[]
export type WatchContractEventOnLogsFn<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
  TStrict extends boolean | undefined = undefined,
> = (logs: WatchContractEventOnLogsParameter<TAbi, TEventName, TStrict>) => void

export type WatchContractEventParameters<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
  TStrict extends boolean | undefined = undefined,
> = {
  /** The address of the contract. */
  address?: Address | Address[]
  /** Contract ABI. */
  abi: TAbi
  args?: GetEventArgs<TAbi, TEventName>
  /** Contract event. */
  eventName?: InferEventName<TAbi, TEventName>
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** The callback to call when new event logs are received. */
  onLogs: WatchContractEventOnLogsFn<TAbi, TEventName, TStrict>
  /**
   * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
   * @default false
   */
  strict?: TStrict
} & (GetTransportConfig<Transport>['type'] extends 'webSocket'
  ?
      | {
          batch?: never
          /**
           * Whether or not the WebSocket Transport should poll the JSON-RPC, rather than using `eth_subscribe`.
           * @default false
           */
          poll?: false
          pollingInterval?: never
        }
      | (PollOptions & {
          /**
           * Whether or not the WebSocket Transport should poll the JSON-RPC, rather than using `eth_subscribe`.
           * @default true
           */
          poll?: true
        })
  : PollOptions & {
      poll?: true
    })

export type WatchContractEventReturnType = () => void

export type WatchContractEventErrorType =
  | StringifyErrorType
  | ObserveErrorType
  | ErrorType

/**
 * Watches and returns emitted contract event logs.
 *
 * - Docs: https://viem.sh/docs/contract/watchContractEvent.html
 *
 * This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent.html#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent.html#onLogs).
 *
 * `watchContractEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter.html) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchContractEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
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
  const TAbi extends Abi | readonly unknown[],
  TEventName extends string,
  TStrict extends boolean | undefined = undefined,
>(
  client: Client<Transport, TChain>,
  {
    abi,
    address,
    args,
    batch = true,
    eventName,
    onError,
    onLogs,
    poll: poll_,
    pollingInterval = client.pollingInterval,
    strict: strict_,
  }: WatchContractEventParameters<TAbi, TEventName, TStrict>,
): WatchContractEventReturnType {
  const enablePolling =
    typeof poll_ !== 'undefined' ? poll_ : client.transport.type !== 'webSocket'

  const pollContractEvent = () => {
    const observerId = stringify([
      'watchContractEvent',
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
    ])
    const strict = strict_ ?? false

    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber: bigint
      let filter: Filter<'event', TAbi, TEventName> | undefined
      let initialized = false

      const unwatch = poll(
        async () => {
          if (!initialized) {
            try {
              filter = (await getAction(
                client,
                createContractEventFilter,
                'createContractEventFilter',
              )({
                abi,
                address,
                args,
                eventName,
                strict,
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
              logs = await getAction(
                client,
                getFilterChanges,
                'getFilterChanges',
              )({ filter })
            } else {
              // If the filter doesn't exist, we will fall back to use `getLogs`.
              // The fall back exists because some RPC Providers do not support filters.

              // Fetch the block number to use for `getLogs`.
              const blockNumber = await getAction(
                client,
                getBlockNumber,
                'getBlockNumber',
              )({})

              // If the block number has changed, we will need to fetch the logs.
              // If the block number doesn't exist, we are yet to reach the first poll interval,
              // so do not emit any logs.
              if (previousBlockNumber && previousBlockNumber !== blockNumber) {
                logs = await getAction(
                  client,
                  getContractEvents,
                  'getContractEvents',
                )({
                  abi,
                  address,
                  args,
                  eventName,
                  fromBlock: previousBlockNumber + 1n,
                  toBlock: blockNumber,
                  strict,
                } as {} as GetContractEventsParameters)
              } else {
                logs = []
              }
              previousBlockNumber = blockNumber
            }

            if (logs.length === 0) return
            if (batch) emit.onLogs(logs as any)
            else for (const log of logs) emit.onLogs([log] as any)
          } catch (err) {
            // If a filter has been set and gets uninstalled, providers will throw an InvalidInput error.
            // Reinitalize the filter when this occurs
            if (filter && err instanceof InvalidInputRpcError)
              initialized = false
            emit.onError?.(err as Error)
          }
        },
        {
          emitOnBegin: true,
          interval: pollingInterval,
        },
      )

      return async () => {
        if (filter)
          await getAction(
            client,
            uninstallFilter,
            'uninstallFilter',
          )({ filter })
        unwatch()
      }
    })
  }

  const subscribeContractEvent = () => {
    let active = true
    let unsubscribe = () => (active = false)
    ;(async () => {
      try {
        const topics: LogTopic[] = eventName
          ? encodeEventTopics({
              abi: abi,
              eventName: eventName,
              args,
            } as EncodeEventTopicsParameters)
          : []

        const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
          params: ['logs', { address, topics }],
          onData(data: any) {
            if (!active) return
            const log = data.result
            try {
              const { eventName, args } = decodeEventLog({
                abi: abi,
                data: log.data,
                topics: log.topics as any,
                strict: strict_,
              })
              const formatted = formatLog(log, {
                args,
                eventName: eventName as string,
              })
              onLogs([formatted] as any)
            } catch (err) {
              let eventName
              let isUnnamed
              if (
                err instanceof DecodeLogDataMismatch ||
                err instanceof DecodeLogTopicsMismatch
              ) {
                // If strict mode is on, and log data/topics do not match event definition, skip.
                if (strict_) return
                eventName = err.abiItem.name
                isUnnamed = err.abiItem.inputs?.some(
                  (x) => !('name' in x && x.name),
                )
              }

              // Set args to empty if there is an error decoding (e.g. indexed/non-indexed params mismatch).
              const formatted = formatLog(log, {
                args: isUnnamed ? [] : {},
                eventName,
              })
              onLogs([formatted] as any)
            }
          },
          onError(error: Error) {
            onError?.(error)
          },
        })
        unsubscribe = unsubscribe_
        if (!active) unsubscribe()
      } catch (err) {
        onError?.(err as Error)
      }
    })()
    return unsubscribe
  }

  return enablePolling ? pollContractEvent() : subscribeContractEvent()
}
