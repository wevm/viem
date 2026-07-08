import type { Address, Errors } from 'ox'

import type * as Client from '../../Client.js'
import { request } from '../internal/test/request.js'

/**
 * Returns a summary of all the transactions currently pending for inclusion in
 * the next block(s), as well as the ones that are being scheduled for future
 * execution only.
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
 * const txpool = await Actions.test.txpool.inspect(client)
 * ```
 */
export async function inspect(
  client: Client.Client,
): Promise<inspect.ReturnType> {
  return await request(client)({ method: 'txpool_inspect' })
}

export declare namespace inspect {
  type ReturnType = {
    pending: Record<Address.Address, Record<string, string>>
    queued: Record<Address.Address, Record<string, string>>
  }
  type ErrorType = Errors.GlobalErrorType
}
