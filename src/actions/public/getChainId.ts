import * as Hex from 'ox/Hex'

import type * as Client from '../../core/Client.js'

/**
 * Returns the chain ID associated with the current network.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import * as actions from 'viem/actions'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const chainId = await actions.public.getChainId(client)
 * // @log: 1n
 * ```
 *
 * @param client - Client to use.
 * @returns Chain ID.
 */
export async function getChainId<client extends Client.Client>(
  client: client,
): getChainId.ReturnType {
  const chainId = await client.request(
    {
      method: 'eth_chainId',
    },
    { dedupe: true },
  )
  return Hex.toBigInt(chainId as Hex.Hex)
}

export declare namespace getChainId {
  type ReturnType = Promise<bigint>

  type ErrorType = Hex.toBigInt.ErrorType
}
