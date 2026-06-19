import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import { request } from './internal/request.js'

/**
 * Returns a summary of all the transactions currently pending for inclusion in
 * the next block(s), as well as the ones that are being scheduled for future
 * execution only.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * const status = await Actions.test.getTxpoolStatus(client)
 * ```
 */
export async function getTxpoolStatus(
  client: Client.Client,
): Promise<getTxpoolStatus.ReturnType> {
  const { pending, queued } = await request(client)({
    method: 'txpool_status',
  })
  return {
    pending: Hex.toNumber(pending),
    queued: Hex.toNumber(queued),
  }
}

export declare namespace getTxpoolStatus {
  type ReturnType = {
    pending: number
    queued: number
  }
  type ErrorType = Errors.GlobalErrorType
}
