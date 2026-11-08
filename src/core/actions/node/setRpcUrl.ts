import type { Errors } from 'ox'

import type * as Client from '../../Client.js'
import type * as Mode from '../internal/test/mode.js'
import { request } from '../internal/test/request.js'

/**
 * Sets the backend RPC URL.
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
 * await Actions.node.setRpcUrl(client, { jsonRpcUrl: 'https://eth.merkle.io' })
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
