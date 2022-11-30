import { NetworkRpc } from '../../rpcs'

export type FetchBlockNumberResponse = number

export async function fetchBlockNumber(
  rpc: NetworkRpc,
): Promise<FetchBlockNumberResponse> {
  const blockNumber = await rpc.request({
    method: 'eth_blockNumber',
  })
  return Number(BigInt(blockNumber))
}
