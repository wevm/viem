import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import { getCache, withCache } from '../../utils/promise/withCache.js'

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
 * Returns the number of the most recent block seen.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlockNumber.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/fetching-blocks
 * - JSON-RPC Methods: [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber)
 *
 * @param client - Client to use
 * @param parameters - {@link GetBlockNumberParameters}
 * @returns The number of the block. {@link GetBlockNumberReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlockNumber } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const blockNumber = await getBlockNumber(client)
 * // 69420n
 */
export async function getBlockNumber<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
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
