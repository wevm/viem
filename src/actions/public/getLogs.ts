import type { AbiEvent, Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockNumber, BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type {
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
} from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Hash, LogTopic } from '../../types/misc.js'
import type { RpcLog } from '../../types/rpc.js'
import type { DecodeEventLogErrorType } from '../../utils/abi/decodeEventLog.js'
import {
  type EncodeEventTopicsErrorType,
  type EncodeEventTopicsParameters,
  encodeEventTopics,
} from '../../utils/abi/encodeEventTopics.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import {
  type FormatLogErrorType,
  formatLog,
} from '../../utils/formatters/log.js'

export type GetLogsParameters<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = TAbiEvent extends AbiEvent ? [TAbiEvent] : undefined,
  TStrict extends boolean | undefined = undefined,
  TFromBlock extends BlockNumber | BlockTag | undefined = undefined,
  TToBlock extends BlockNumber | BlockTag | undefined = undefined,
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = {
  /** Address or list of addresses from which logs originated */
  address?: Address | Address[] | undefined
} & (
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
      events: TAbiEvents
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
) &
  (
    | {
        /** Block number or tag after which to include logs */
        fromBlock?: TFromBlock | BlockNumber | BlockTag | undefined
        /** Block number or tag before which to include logs */
        toBlock?: TToBlock | BlockNumber | BlockTag | undefined
        blockHash?: undefined
      }
    | {
        fromBlock?: undefined
        toBlock?: undefined
        /** Hash of block to include logs from */
        blockHash?: Hash | undefined
      }
  )

export type GetLogsReturnType<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = TAbiEvent extends AbiEvent ? [TAbiEvent] : undefined,
  TStrict extends boolean | undefined = undefined,
  TFromBlock extends BlockNumber | BlockTag | undefined = undefined,
  TToBlock extends BlockNumber | BlockTag | undefined = undefined,
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  _Pending extends boolean =
    | (TFromBlock extends 'pending' ? true : false)
    | (TToBlock extends 'pending' ? true : false),
> = Log<bigint, number, _Pending, TAbiEvent, TStrict, TAbiEvents, _EventName>[]

export type GetLogsErrorType =
  | DecodeEventLogErrorType
  | EncodeEventTopicsErrorType
  | FormatLogErrorType
  | NumberToHexErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns a list of event logs matching the provided parameters.
 *
 * - Docs: https://viem.sh/docs/actions/public/getLogs
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/filters-and-logs/event-logs
 * - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
 *
 * @param client - Client to use
 * @param parameters - {@link GetLogsParameters}
 * @returns A list of event logs. {@link GetLogsReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getLogs } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const logs = await getLogs(client)
 */
export async function getLogs<
  TChain extends Chain | undefined,
  const TAbiEvent extends AbiEvent | undefined = undefined,
  const TAbiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = TAbiEvent extends AbiEvent ? [TAbiEvent] : undefined,
  TStrict extends boolean | undefined = undefined,
  TFromBlock extends BlockNumber | BlockTag | undefined = undefined,
  TToBlock extends BlockNumber | BlockTag | undefined = undefined,
>(
  client: Client<Transport, TChain>,
  {
    address,
    blockHash,
    fromBlock,
    toBlock,
    event,
    events: events_,
    args,
    strict: strict_,
  }: GetLogsParameters<
    TAbiEvent,
    TAbiEvents,
    TStrict,
    TFromBlock,
    TToBlock
  > = {},
): Promise<
  GetLogsReturnType<TAbiEvent, TAbiEvents, TStrict, TFromBlock, TToBlock>
> {
  const strict = strict_ ?? false
  const events = events_ ?? (event ? [event] : undefined)

  let topics: LogTopic[] = []
  if (events) {
    topics = [
      (events as AbiEvent[]).flatMap((event) =>
        encodeEventTopics({
          abi: [event],
          eventName: (event as AbiEvent).name,
          args,
        } as EncodeEventTopicsParameters),
      ),
    ]
    if (event) topics = topics[0] as LogTopic[]
  }

  let logs: RpcLog[]
  if (blockHash) {
    logs = await client.request({
      method: 'eth_getLogs',
      params: [{ address, topics, blockHash }],
    })
  } else {
    logs = await client.request({
      method: 'eth_getLogs',
      params: [
        {
          address,
          topics,
          fromBlock:
            typeof fromBlock === 'bigint' ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === 'bigint' ? numberToHex(toBlock) : toBlock,
        },
      ],
    })
  }

  const formattedLogs = logs.map((log) => formatLog(log))
  if (!events)
    return formattedLogs as GetLogsReturnType<
      TAbiEvent,
      TAbiEvents,
      TStrict,
      TFromBlock,
      TToBlock
    >
  return parseEventLogs({
    abi: events,
    logs: formattedLogs,
    strict,
  }) as unknown as GetLogsReturnType<
    TAbiEvent,
    TAbiEvents,
    TStrict,
    TFromBlock,
    TToBlock
  >
}
