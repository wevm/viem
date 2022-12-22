import type { PublicClient } from '../../clients'

export type GetBlockNumberResponse = bigint

/**
 * @description Returns the number of the most recent block seen.
 */
export async function getBlockNumber(
  client: PublicClient,
): Promise<GetBlockNumberResponse> {
  const blockNumber = await client.request({
    method: 'eth_blockNumber',
  })
  return BigInt(blockNumber)
}
