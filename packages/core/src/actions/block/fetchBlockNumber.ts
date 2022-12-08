import type { PublicClient } from '../../clients'

export type FetchBlockNumberResponse = bigint

/**
 * @description Returns the number of the most recent block seen.
 */
export async function fetchBlockNumber(
  client: PublicClient,
): Promise<FetchBlockNumberResponse> {
  const blockNumber = await client.request({
    method: 'eth_blockNumber',
  })
  return BigInt(blockNumber)
}
