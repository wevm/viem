import type { AbiEvent, Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type {
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
} from '../../types/contract.js'
import type { Filter } from '../../types/filter.js'
import type { Log } from '../../types/log.js'
import type { LogTopic } from '../../types/misc.js'
import type { GetPollOptions } from '../../types/transport.js'
import {
  type EncodeEventTopicsParameters,
  encodeEventTopics,
} from '../../utils/abi/encodeEventTopics.js'
import { type ObserveErrorType, observe } from '../../utils/observe.js'
import { poll } from '../../utils/poll.js'
import { type StringifyErrorType, stringify } from '../../utils/stringify.js'

import {
  DecodeLogDataMismatch,
  DecodeLogTopicsMismatch,
} from '../../errors/abi.js'
import { InvalidInputRpcError } from '../../errors/rpc.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockNumber } from '../../types/block.js'
import { decodeEventLog } from '../../utils/abi/decodeEventLog.js'
import { formatLog } from '../../utils/formatters/log.js'
import { getAction } from '../../utils/getAction.js'
import {
  type CreateEventFilterParameters,
  createEventFilter,
} from './createEventFilter.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getFilterChanges } from './getFilterChanges.js'
import { type GetLogsParameters, getLogs } from './getLogs.js'
import { uninstallFilter } from './uninstallFilter.js'

export type WatchEventOnLogsParameter<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = TAbiEvent extends AbiEvent ? [TAbiEvent] : undefined,
  TStrict extends boolean | undefined = undefined,
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = Log<bigint, number, false, TAbiEvent, TStrict, TAbiEvents, TEventName>[]
export type WatchEventOnLogsFn<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = TAbiEvent extends AbiEvent ? [TAbiEvent] : undefined,
  TStrict extends boolean | undefined = undefined,
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = (
  logs: WatchEventOnLogsParameter<TAbiEvent, TAbiEvents, TStrict, _EventName>,
) => void

export type WatchEventParameters<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = TAbiEvent extends AbiEvent ? [TAbiEvent] : undefined,
  TStrict extends boolean | undefined = undefined,
  TTransport extends Transport = Transport,
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = {
  /** The address of the contract. */
  address?: Address | Address[] | undefined
  /** Block to start listening from. */
  fromBlock?: BlockNumber<bigint> | undefined
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: ((error: Error) => void) | undefined
  /** The callback to call when new event logs are received. */
  onLogs: WatchEventOnLogsFn<TAbiEvent, TAbiEvents, TStrict, _EventName>
} & GetPollOptions<TTransport> &
  (
    | {
        event: TAbiEvent
        events?: undefined
        args?: MaybeExtractEventArgsFromAbi<TAbiEvents, _EventName> | undefined
        /**
         * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
         * @default false
         */
        strict?: TStrict | undefined
      }
    | {
        event?: undefined
        events?: TAbiEvents | undefined
        args?: undefined
        /**
         * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
         * @default false
         */
        strict?: TStrict | undefined
      }
    | {
        event?: undefined
        events?: undefined
        args?: undefined
        strict?: undefined
      }
  )

export type WatchEventReturnType = () => void

export type WatchEventErrorType =
  | StringifyErrorType
  | ObserveErrorType
  | ErrorType

/**
 * Watches and returns emitted [Event Logs](https://viem.sh/docs/glossary/terms#event-log).
 *
 * - Docs: https://viem.sh/docs/actions/public/watchEvent
 * - JSON-RPC Methods:
 *   - **RPC Provider supports `eth_newFilter`:**
 *     - Calls [`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter) to create a filter (called on initialize).
 *     - On a polling interval, it will call [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges).
 *   - **RPC Provider does not support `eth_newFilter`:**
 *     - Calls [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs) for each block between the polling interval.
 *
 * This Action will batch up all the Event Logs found within the [`pollingInterval`](https://viem.sh/docs/actions/public/watchEvent#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/actions/public/watchEvent#onLogs).
 *
 * `watchEvent` will attempt to create an [Event Filter](https://viem.sh/docs/actions/public/createEventFilter) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchEventParameters}
 * @returns A function that can be invoked to stop watching for new Event Logs. {@link WatchEventReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { watchEvent } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = watchEvent(client, {
 *   onLogs: (logs) => console.log(logs),
 * })
 */
export function watchEvent<
  TChain extends Chain | undefined,
  const TAbiEvent extends AbiEvent | undefined = undefined,
  const TAbiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = TAbiEvent extends AbiEvent ? [TAbiEvent] : undefined,
  TStrict extends boolean | undefined = undefined,
  TTransport extends Transport = Transport,
  _EventName extends string | undefined = undefined,
>(
  client: Client<TTransport, TChain>,
  {
    address,
    args,
    batch = true,
    event,
    events,
    fromBlock,
    onError,
    onLogs,
    poll: poll_,
    pollingInterval = client.pollingInterval,
    strict: strict_,
  }: WatchEventParameters<TAbiEvent, TAbiEvents, TStrict, TTransport>,
): WatchEventReturnType {
  const enablePolling = (() => {
    if (typeof poll_ !== 'undefined') return poll_
    if (typeof fromBlock === 'bigint') return true
    if (client.transport.type === 'webSocket') return false
    if (
      client.transport.type === 'fallback' &&
      client.transport.transports[0].config.type === 'webSocket'
    )
      return false
    return true
  })()
  const strict = strict_ ?? false

  const pollEvent = () => {
    const observerId = stringify([
      'watchEvent',
      address,
      args,
      batch,
      client.uid,
      event,
      pollingInterval,
      fromBlock,
    ])

    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber: bigint
      if (fromBlock !== undefined) previousBlockNumber = fromBlock - 1n
      let filter: Filter<'event', TAbiEvents, _EventName, any>
      let initialized = false

      const unwatch = poll(
        async () => {
          if (!initialized) {
            try {
              filter = (await getAction(
                client,
                createEventFilter as any,
                'createEventFilter',
              )({
                address,
                args,
                event: event!,
                events,
                strict,
                fromBlock,
              } as unknown as CreateEventFilterParameters)) as unknown as Filter<
                'event',
                TAbiEvents,
                _EventName
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
                  getLogs,
                  'getLogs',
                )({
                  address,
                  args,
                  event: event!,
                  events,
                  fromBlock: previousBlockNumber + 1n,
                  toBlock: blockNumber,
                } as unknown as GetLogsParameters)
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

  const subscribeEvent = () => {
    let active = true
    let unsubscribe = () => (active = false)
    ;(async () => {
      try {
        const transport = (() => {
          if (client.transport.type === 'fallback') {
            const transport = client.transport.transports.find(
              (transport: ReturnType<Transport>) =>
                transport.config.type === 'webSocket',
            )
            if (!transport) return client.transport
            return transport.value
          }
          return client.transport
        })()

        const events_ = events ?? (event ? [event] : undefined)
        let topics: LogTopic[] = []
        if (events_) {
          topics = [
            (events_ as AbiEvent[]).flatMap((event) =>
              encodeEventTopics({
                abi: [event],
                eventName: (event as AbiEvent).name,
                args,
              } as EncodeEventTopicsParameters),
            ),
          ]
          if (event) topics = topics[0] as LogTopic[]
        }

        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ['logs', { address, topics }],
          onData(data: any) {
            if (!active) return
            const log = data.result
            try {
              const { eventName, args } = decodeEventLog({
                abi: events_ ?? [],
                data: log.data,
                topics: log.topics,
                strict,
              })
              const formatted = formatLog(log, { args, eventName })
              onLogs([formatted] as any)
            } catch (err) {
              let eventName: string | undefined
              let isUnnamed: boolean | undefined
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
    return () => unsubscribe()
  }

  return enablePolling ? pollEvent() : subscribeEvent()
}
