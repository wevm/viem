import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Sets the backend RPC URL.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * await Actions.test.setRpcUrl(client, { jsonRpcUrl: 'https://eth.merkle.io' })
 * ```
 */
export async function setRpcUrl(
  client: Client.Client,
  options: setRpcUrl.Options,
): Promise<void> {
  const { jsonRpcUrl, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_setRpcUrl`,
    params: [jsonRpcUrl],
  })
}

export declare namespace setRpcUrl {
  type Options = {
    /** The JSON-RPC URL. */
    jsonRpcUrl: string
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
