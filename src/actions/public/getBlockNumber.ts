import type { Client, PublicClient } from '../../clients'
import type { Chain } from '../../types'
import { getCache, withCache } from '../../utils/promise'

export type GetBlockNumberParameters = {
  /** The maximum age (in ms) of the cached value. */
  maxAge?: number
}

export type GetBlockNumberReturnType = bigint

const cacheKey = (id: string) => `blockNumber.${id}`

export function getBlockNumberCache(id: string) {
  return getCache(cacheKey(id))
}

/**
 * @description Returns the number of the most recent block seen.
 */
export async function getBlockNumber<TChain extends Chain | undefined>(
  client: PublicClient<TChain> | Client<TChain>,
  { maxAge = client.pollingInterval }: GetBlockNumberParameters = {},
): Promise<GetBlockNumberReturnType> {
  const blockNumberHex = await withCache(
    () =>
      client.request({
        method: 'eth_blockNumber',
      }),
    { cacheKey: cacheKey(client.uid), maxAge },
  )
  return BigInt(blockNumberHex)
}
