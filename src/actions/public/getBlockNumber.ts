import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { withCache } from '../../core/internal/promise.js'

const cacheKey = (uid: string) => `blockNumber.${uid}`

/**
 * Returns the number of the most recent block.
 *
 * @example
 * ```ts twoslash
 * import { Client, actions, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const blockNumber = await actions.getBlockNumber(client)
 * // @log: 69420n
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Block number.
 */
export async function getBlockNumber<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getBlockNumber.Options = {},
): getBlockNumber.ReturnType {
  const cacheTime = options.cacheTime ?? client.cacheTime
  const blockNumber = await withCache(
    () =>
      client.request({
        method: 'eth_blockNumber',
      }),
    { cacheKey: cacheKey(client.uid), cacheTime },
  )
  return Hex.toBigInt(blockNumber)
}

export declare namespace getBlockNumber {
  type Options = {
    /** Time in milliseconds that cached block number remains in memory. */
    cacheTime?: number | undefined
  }

  type ReturnType = Promise<bigint>

  type ErrorType = Hex.toBigInt.ErrorType
}
