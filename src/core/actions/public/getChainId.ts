import type * as Errors from 'ox/Errors'
import { z } from 'ox/zod'

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
 * const chainId = await Actions.getChainId(client)
 * ```
 */
export async function getChainId(
  client: Client.Client,
): Promise<getChainId.ReturnType> {
  const chainId = await client.request(
    { method: 'eth_chainId' },
    { dedupe: true },
  )
  return z.RpcSchema.decodeReturns(z.RpcSchema.Eth, 'eth_chainId', chainId)
}

export declare namespace getChainId {
  type ReturnType = number
  type ErrorType = Errors.GlobalErrorType
}
