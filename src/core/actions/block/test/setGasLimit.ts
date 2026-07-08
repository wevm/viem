import { Hex } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Sets the block's gas limit.
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
 * await Actions.test.block.setGasLimit(client, { gasLimit: 420_000n })
 * ```
 */
export async function setGasLimit(
  client: Client.Client,
  options: setGasLimit.Options,
): Promise<void> {
  const { gasLimit, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_setBlockGasLimit`,
    params: [Hex.fromNumber(gasLimit)],
  })
}

export declare namespace setGasLimit {
  type Options = {
    /** Gas limit (in wei). */
    gasLimit: bigint
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
