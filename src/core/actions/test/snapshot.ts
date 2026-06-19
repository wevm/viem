import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import { request } from './internal/request.js'

/**
 * Snapshot the state of the blockchain at the current block.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * const id = await Actions.test.snapshot(client)
 * ```
 */
export async function snapshot(
  client: Client.Client,
): Promise<snapshot.ReturnType> {
  return await request(client)({ method: 'evm_snapshot' })
}

export declare namespace snapshot {
  type ReturnType = Hex.Hex
  type ErrorType = Errors.GlobalErrorType
}
