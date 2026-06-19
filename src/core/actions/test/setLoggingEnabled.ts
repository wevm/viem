import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Enable or disable logging on the test node network.
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
 * await Actions.test.setLoggingEnabled(client, { enabled: true })
 * ```
 */
export async function setLoggingEnabled(
  client: Client.Client,
  options: setLoggingEnabled.Options,
): Promise<void> {
  const { enabled, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_setLoggingEnabled`,
    params: [enabled],
  })
}

export declare namespace setLoggingEnabled {
  type Options = {
    /** Whether to enable or disable logging. */
    enabled: boolean
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
