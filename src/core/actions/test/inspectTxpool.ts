import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

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
 * const txpool = await Actions.test.inspectTxpool(client)
 * ```
 */
export async function inspectTxpool(
  client: Client.Client,
): Promise<inspectTxpool.ReturnType> {
  return await request(client)({ method: 'txpool_inspect' })
}

export declare namespace inspectTxpool {
  type ReturnType = {
    pending: Record<Address.Address, Record<string, string>>
    queued: Record<Address.Address, Record<string, string>>
  }
  type ErrorType = Errors.GlobalErrorType
}
