import type { AbiEvent, Narrow } from 'abitype'
import type { PublicClient, Transport } from '../../clients/index.js'
import type {
  Address,
  BlockNumber,
  BlockTag,
  Chain,
  Hash,
  Log,
  LogTopic,
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
  RpcLog,
} from '../../types/index.js'
import type { EncodeEventTopicsParameters } from '../../utils/index.js'
import {
  decodeEventLog,
  encodeEventTopics,
  numberToHex,
} from '../../utils/index.js'
import { formatLog } from '../../utils/formatters/log.js'

export type GetLogsParameters<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = {
  /** Address or list of addresses from which logs originated */
  address?: Address | Address[]
} & (
  | {
      event: Narrow<TAbiEvent>
      args?: MaybeExtractEventArgsFromAbi<[TAbiEvent], TEventName>
    }
  | {
      event?: never
      args?: never
    }
) &
  (
    | {
        /** Block number or tag after which to include logs */
        fromBlock?: BlockNumber<bigint> | BlockTag
        /** Block number or tag before which to include logs */
        toBlock?: BlockNumber<bigint> | BlockTag
        blockHash?: never
      }
    | {
        fromBlock?: never
        toBlock?: never
        /** Hash of block to include logs from */
        blockHash?: Hash
      }
  )

export type GetLogsReturnType<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = Log<bigint, number, TAbiEvent, [TAbiEvent], TEventName>[]

/**
 * Returns a list of event logs matching the provided parameters.
 *
 * - Docs: https://viem.sh/docs/actions/public/getLogs.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/filters-and-logs/event-logs
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
  TAbiEvent extends AbiEvent | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    blockHash,
    fromBlock,
    toBlock,
    event,
    args,
  }: GetLogsParameters<TAbiEvent> = {},
): Promise<GetLogsReturnType<TAbiEvent>> {
  let topics: LogTopic[] = []
  if (event)
    topics = encodeEventTopics({
      abi: [event],
      eventName: (event as AbiEvent).name,
      args,
    } as EncodeEventTopicsParameters)

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

  return logs
    .map((log) => {
      try {
        const { eventName, args } = event
          ? decodeEventLog({
              abi: [event],
              data: log.data,
              topics: log.topics as any,
            })
          : { eventName: undefined, args: undefined }
        return formatLog(log, { args, eventName })
      } catch {
        // Skip log if there is an error decoding (e.g. indexed/non-indexed params mismatch).
        return
      }
    })
    .filter(Boolean) as unknown as GetLogsReturnType<TAbiEvent>
}
