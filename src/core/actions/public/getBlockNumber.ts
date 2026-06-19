import type * as Errors from 'ox/Errors'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'
import { withCache } from '../internal/withCache.js'

/**
 * Returns the number of the most recent block seen.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const blockNumber = await Actions.getBlockNumber(client)
 * ```
 */
export async function getBlockNumber(
  client: Client.Client,
  options: getBlockNumber.Options = {},
): Promise<getBlockNumber.ReturnType> {
  const { cacheTime = client.cacheTime } = options
  const blockNumber = await withCache(
    () => client.request({ method: 'eth_blockNumber' }),
    { cacheKey: `blockNumber.${client.uid}`, cacheTime },
  )
  return z.RpcSchema.decodeReturns(
    z.RpcSchema.Eth,
    'eth_blockNumber',
    blockNumber,
  )
}

export declare namespace getBlockNumber {
  type Options = {
    /** Time (ms) the cached block number stays fresh. @default client.cacheTime */
    cacheTime?: number | undefined
  }
  type ReturnType = bigint
  type ErrorType = Errors.GlobalErrorType
}
