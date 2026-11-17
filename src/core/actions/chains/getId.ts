import { type Errors, Hex } from 'ox'

import type * as Client from '../../Client.js'

/**
 * Returns the chain ID associated with the current network.
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
 * const chainId = await Actions.chains.getId(client)
 * ```
 */
export async function getId(client: Client.Client): Promise<getId.ReturnType> {
  const chainId = await client.request(
    { method: 'eth_chainId' },
    { dedupe: true },
  )
  return Hex.toNumber(chainId)
}

export declare namespace getId {
  type ReturnType = number
  type ErrorType = Errors.GlobalErrorType
}
