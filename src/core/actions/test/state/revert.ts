import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../../Client.js'
import { request } from '../internal/request.js'

/**
 * Revert the state of the blockchain at the current block.
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
 * await Actions.test.state.revert(client, { id: '0x1' })
 * ```
 */
export async function revert(
  client: Client.Client,
  options: revert.Options,
): Promise<void> {
  const { id } = options
  await request(client)({ method: 'evm_revert', params: [id] })
}

export declare namespace revert {
  type Options = {
    /** The snapshot ID to revert to. */
    id: Hex.Hex
  }
  type ErrorType = Errors.GlobalErrorType
}
