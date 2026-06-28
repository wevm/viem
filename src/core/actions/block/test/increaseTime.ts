import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../../Client.js'
import { request } from '../../internal/test/request.js'

/**
 * Jump forward in time by the given amount of time, in seconds.
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
 * await Actions.test.block.increaseTime(client, { seconds: 420 })
 * ```
 */
export async function increaseTime(
  client: Client.Client,
  options: increaseTime.Options,
): Promise<increaseTime.ReturnType> {
  const { seconds } = options
  return await request(client)({
    method: 'evm_increaseTime',
    params: [Hex.fromNumber(seconds)],
  })
}

export declare namespace increaseTime {
  type Options = {
    /** The amount of seconds to jump forward in time. */
    seconds: number
  }
  type ReturnType = Hex.Hex
  type ErrorType = Errors.GlobalErrorType
}
