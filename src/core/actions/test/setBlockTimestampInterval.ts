import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Similar to `increaseTime`, but sets a block timestamp `interval`. The
 * timestamp of future blocks will be computed as `lastBlock_timestamp` +
 * `interval`.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * await Actions.test.setBlockTimestampInterval(client, { interval: 5 })
 * ```
 */
export async function setBlockTimestampInterval(
  client: Client.Client,
  options: setBlockTimestampInterval.Options,
): Promise<void> {
  const { interval, mode = 'anvil' } = options
  const interval_ = mode === 'hardhat' ? interval * 1000 : interval
  await request(client)({
    method: `${mode}_setBlockTimestampInterval`,
    params: [interval_],
  })
}

export declare namespace setBlockTimestampInterval {
  type Options = {
    /** The interval (in seconds). */
    interval: number
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
