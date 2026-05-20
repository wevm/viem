import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'

/**
 * Returns the current gas price in wei.
 *
 * @example
 * ```ts twoslash
 * import { Client, actions, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const gasPrice = await actions.getGasPrice(client)
 * // @log: 1000000000n
 * ```
 *
 * @param client - Client to use.
 * @returns Gas price in wei.
 */
export async function getGasPrice<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>): getGasPrice.ReturnType {
  const gasPrice = await client.request({
    method: 'eth_gasPrice',
  })
  return Hex.toBigInt(gasPrice)
}

export declare namespace getGasPrice {
  type ReturnType = Promise<bigint>

  type ErrorType = Hex.toBigInt.ErrorType
}
