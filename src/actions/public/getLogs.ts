import type { PublicClient } from '../../clients'
import type {
  Log,
  RpcLog,
  Address,
  BlockNumber,
  BlockTag,
  Hash,
  LogTopic,
} from '../../types'
import { numberToHex } from '../../utils'
import { formatLog } from '../../utils/formatters/log'
import { buildFilterTopics, EventFilterArgs } from './createEventFilter'

export type GetLogsArgs<TEventDefinition extends `${string}(${string})`> = {
  /** Address or list of addresses from which logs originated */
  address?: Address | Address[]
} & (
  | { event: TEventDefinition; args?: EventFilterArgs<TEventDefinition> }
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

export type GetLogsResponse = Log[]

/**
 * @description Returns a collection of event logs.
 */
export async function getLogs<TEventDefinition extends `${string}(${string})`,>(
  client: PublicClient,
  {
    address,
    blockHash,
    fromBlock,
    toBlock,
    event,
    args,
  }: GetLogsArgs<TEventDefinition> = {},
): Promise<GetLogsResponse> {
  let topics: LogTopic[] = []
  if (event) {
    topics = buildFilterTopics({ event, args })
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

  return logs.map(formatLog)
}
