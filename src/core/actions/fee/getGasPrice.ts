import type * as Errors from 'ox/Errors'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'

/**
 * Returns the current price of gas (in wei).
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
 * const gasPrice = await Actions.fee.getGasPrice(client)
 * ```
 */
export async function getGasPrice(
  client: Client.Client,
): Promise<getGasPrice.ReturnType> {
  const gasPrice = await client.request({ method: 'eth_gasPrice' })
  return z.RpcSchema.decodeReturns(z.RpcSchema.Eth, 'eth_gasPrice', gasPrice)
}

export declare namespace getGasPrice {
  type ReturnType = bigint
  type ErrorType = Errors.GlobalErrorType
}
