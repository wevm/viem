import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import { request } from '../internal/test/request.js'

/**
 * Snapshot the state of the blockchain at the current block.
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
 * const id = await Actions.test.state.snapshot(client)
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
