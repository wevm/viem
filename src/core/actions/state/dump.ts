import type { Errors, Hex } from 'ox'

import type * as Client from '../../Client.js'
import type * as Mode from '../internal/test/mode.js'
import { request } from '../internal/test/request.js'

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
 * const state = await Actions.state.dump(client)
 * ```
 */
export async function dump(
  client: Client.Client,
  options: dump.Options = {},
): Promise<dump.ReturnType> {
  const { mode = 'anvil' } = options
  return await request(client)({ method: `${mode}_dumpState` })
}

export declare namespace dump {
  type Options = {
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ReturnType = Hex.Hex
  type ErrorType = Errors.GlobalErrorType
}
