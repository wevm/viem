import type { PublicClient } from '../../clients'
import type { Log, GetLogsParameters, RpcLog } from '../../types'
import { numberToHex } from '../../utils'
import { formatLog } from '../../utils/formatters/log'

export type GetLogsArgs = GetLogsParameters<bigint>

export type GetLogsResponse = Log[]

/**
 * @description Returns a collection of event logs.
 */
export async function getLogs(
  client: PublicClient,
  { address, topics, blockHash, fromBlock, toBlock }: GetLogsArgs = {},
): Promise<GetLogsResponse> {
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
