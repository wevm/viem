import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Serializes the current state (including contracts code, contract's storage,
 * accounts properties, etc.) into a savable data blob.
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
 * const state = await Actions.test.dumpState(client)
 * ```
 */
export async function dumpState(
  client: Client.Client,
  options: dumpState.Options = {},
): Promise<dumpState.ReturnType> {
  const { mode = 'anvil' } = options
  return await request(client)({ method: `${mode}_dumpState` })
}

export declare namespace dumpState {
  type Options = {
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ReturnType = Hex.Hex
  type ErrorType = Errors.GlobalErrorType
}
