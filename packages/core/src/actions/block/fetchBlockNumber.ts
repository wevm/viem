import { NetworkClient } from '../../clients'

export type FetchBlockNumberResponse = number

export async function fetchBlockNumber(
  rpc: NetworkClient,
): Promise<FetchBlockNumberResponse> {
  const blockNumber = await rpc.request({
    method: 'eth_blockNumber',
  })
  return Number(BigInt(blockNumber))
}
