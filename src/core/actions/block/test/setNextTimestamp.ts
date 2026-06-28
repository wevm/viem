import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../../Client.js'
import { request } from '../../internal/test/request.js'

/**
 * Sets the next block's timestamp.
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
 * await Actions.test.block.setNextTimestamp(client, { timestamp: 1671744314n })
 * ```
 */
export async function setNextTimestamp(
  client: Client.Client,
  options: setNextTimestamp.Options,
): Promise<void> {
  const { timestamp } = options
  await request(client)({
    method: 'evm_setNextBlockTimestamp',
    params: [Hex.fromNumber(timestamp)],
  })
}

export declare namespace setNextTimestamp {
  type Options = {
    /** The timestamp (in seconds). */
    timestamp: bigint
  }
  type ErrorType = Errors.GlobalErrorType
}
