import type { PublicClient } from '../../clients'

export type FetchBlockNumberResponse = bigint

export async function fetchBlockNumber(
  client: PublicClient,
): Promise<FetchBlockNumberResponse> {
  const blockNumber = await client.request({
    method: 'eth_blockNumber',
  })
  return BigInt(blockNumber)
}
