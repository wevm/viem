import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'

/**
 * Returns the current base fee per blob gas in wei.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const blobBaseFee = await actions.getBlobBaseFee(client)
 * // @log: 1n
 * ```
 *
 * @param client - Client to use.
 * @returns Blob base fee in wei.
 */
export async function getBlobBaseFee<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>): getBlobBaseFee.ReturnType {
  const baseFee = await client.request({
    method: 'eth_blobBaseFee',
  })
  return Hex.toBigInt(baseFee)
}

export declare namespace getBlobBaseFee {
  type ReturnType = Promise<bigint>

  type ErrorType = Hex.toBigInt.ErrorType
}
