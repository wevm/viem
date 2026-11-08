import type { Errors } from 'ox'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Removes `setBlockTimestampInterval` if it exists.
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
 * await Actions.block.removeTimestampInterval(client)
 * ```
 */
export async function removeTimestampInterval(
  client: Client.Client,
  options: removeTimestampInterval.Options = {},
): Promise<void> {
  const { mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_removeBlockTimestampInterval`,
  })
}

export declare namespace removeTimestampInterval {
  type Options = {
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
