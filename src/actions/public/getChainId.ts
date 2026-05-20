import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'

/**
 * Returns the chain ID associated with the current network.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const chainId = await actions.getChainId(client)
 * // @log: 1n
 * ```
 *
 * @param client - Client to use.
 * @returns Chain ID.
 */
export async function getChainId<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>): getChainId.ReturnType {
  const chainId = await client.request(
    {
      method: 'eth_chainId',
    },
    { dedupe: true },
  )
  return Hex.toBigInt(chainId)
}

export declare namespace getChainId {
  type ReturnType = Promise<bigint>

  type ErrorType = Hex.toBigInt.ErrorType
}
