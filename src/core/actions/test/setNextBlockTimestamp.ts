import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import { request } from './internal/request.js'

/**
 * Sets the next block's timestamp.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * await Actions.test.setNextBlockTimestamp(client, { timestamp: 1671744314n })
 * ```
 */
export async function setNextBlockTimestamp(
  client: Client.Client,
  options: setNextBlockTimestamp.Options,
): Promise<void> {
  const { timestamp } = options
  await request(client)({
    method: 'evm_setNextBlockTimestamp',
    params: [Hex.fromNumber(timestamp)],
  })
}

export declare namespace setNextBlockTimestamp {
  type Options = {
    /** The timestamp (in seconds). */
    timestamp: bigint
  }
  type ErrorType = Errors.GlobalErrorType
}
