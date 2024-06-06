import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type GetCacheErrorType,
  getCache,
  withCache,
} from '../../utils/promise/withCache.js'

export type GetBlockNumberParameters = {
  /** Time (in ms) that cached block number will remain in memory. */
  cacheTime?: number | undefined
}

export type GetBlockNumberReturnType = bigint

export type GetBlockNumberErrorType = RequestErrorType | ErrorType

const cacheKey = (id: string) => `blockNumber.${id}`

/** @internal */
export type GetBlockNumberCacheErrorType = GetCacheErrorType | ErrorType

/** @internal */
export function getBlockNumberCache(id: string) {
  return getCache(cacheKey(id))
}

/**
 * Returns the number of the most recent block seen.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlockNumber
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks/fetching-blocks
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
  client: Client<Transport, TChain>,
  { cacheTime = client.cacheTime }: GetBlockNumberParameters = {},
): Promise<GetBlockNumberReturnType> {
  const blockNumberHex = await withCache(
    () =>
      client.request({
        method: 'eth_blockNumber',
      }),
    { cacheKey: cacheKey(client.uid), cacheTime },
  )
  return BigInt(blockNumberHex)
}
