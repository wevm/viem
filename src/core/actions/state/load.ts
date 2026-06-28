import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import type * as Mode from '../internal/test/mode.js'
import { request } from '../internal/test/request.js'

/**
 * Adds state previously dumped with `dumpState` to the current chain.
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
 * await Actions.test.state.load(client, { state: '0x...' })
 * ```
 */
export async function load(
  client: Client.Client,
  options: load.Options,
): Promise<void> {
  const { mode = 'anvil', state } = options
  await request(client)({
    method: `${mode}_loadState`,
    params: [state],
  })
}

export declare namespace load {
  type Options = {
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
    /** The state to load. */
    state: Hex.Hex
  }
  type ErrorType = Errors.GlobalErrorType
}
