import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type * as Mode from '../internal/test/mode.js'
import { request } from '../internal/test/request.js'

/**
 * Resets fork back to its original state.
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
 * await Actions.test.state.reset(client, { blockNumber: 69420n })
 * ```
 */
export async function reset(
  client: Client.Client,
  options: reset.Options = {},
): Promise<void> {
  const { blockNumber, jsonRpcUrl, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_reset`,
    params: [{ forking: { blockNumber: Number(blockNumber), jsonRpcUrl } }],
  })
}

export declare namespace reset {
  type Options = {
    /** The block number to reset from. */
    blockNumber?: bigint | undefined
    /** The JSON-RPC URL. */
    jsonRpcUrl?: string | undefined
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
