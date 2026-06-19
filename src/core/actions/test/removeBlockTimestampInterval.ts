import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Removes `setBlockTimestampInterval` if it exists.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * await Actions.test.removeBlockTimestampInterval(client)
 * ```
 */
export async function removeBlockTimestampInterval(
  client: Client.Client,
  options: removeBlockTimestampInterval.Options = {},
): Promise<void> {
  const { mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_removeBlockTimestampInterval`,
  })
}

export declare namespace removeBlockTimestampInterval {
  type Options = {
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
