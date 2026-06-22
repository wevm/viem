import type * as Errors from 'ox/Errors'
import { z } from 'ox/zod'

import type * as Client from '../../../Client.js'

/**
 * Returns the base fee per blob gas (in wei).
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
 * const blobBaseFee = await Actions.fee.getBlobBaseFee(client)
 * ```
 */
export async function getBlobBaseFee(
  client: Client.Client,
): Promise<getBlobBaseFee.ReturnType> {
  const baseFee = await client.request({ method: 'eth_blobBaseFee' })
  return z.RpcSchema.decodeReturns(z.RpcSchema.Eth, 'eth_blobBaseFee', baseFee)
}

export declare namespace getBlobBaseFee {
  type ReturnType = bigint
  type ErrorType = Errors.GlobalErrorType
}
