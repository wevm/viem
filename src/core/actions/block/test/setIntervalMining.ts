import type { Errors } from 'ox'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Sets the automatic mining interval (in seconds) of blocks. Setting the
 * interval to 0 will disable automatic mining.
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
 * await Actions.block.setIntervalMining(client, { interval: 5 })
 * ```
 */
export async function setIntervalMining(
  client: Client.Client,
  options: setIntervalMining.Options,
): Promise<void> {
  const { interval, mode = 'anvil' } = options
  const interval_ = mode === 'hardhat' ? interval * 1000 : interval
  await request(client)({
    method: 'evm_setIntervalMining',
    params: [interval_],
  })
}

export declare namespace setIntervalMining {
  type Options = {
    /** The mining interval (in seconds). */
    interval: number
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
