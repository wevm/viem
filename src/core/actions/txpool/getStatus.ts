import { Hex } from 'ox'
import type { Errors } from 'ox'

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
 * const status = await Actions.test.txpool.getStatus(client)
 * ```
 */
export async function getStatus(
  client: Client.Client,
): Promise<getStatus.ReturnType> {
  const { pending, queued } = await request(client)({
    method: 'txpool_status',
  })
  return {
    pending: Hex.toNumber(pending),
    queued: Hex.toNumber(queued),
  }
}

export declare namespace getStatus {
  type ReturnType = {
    pending: number
    queued: number
  }
  type ErrorType = Errors.GlobalErrorType
}
