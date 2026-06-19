import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Sets the block's gas limit.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * await Actions.test.setBlockGasLimit(client, { gasLimit: 420_000n })
 * ```
 */
export async function setBlockGasLimit(
  client: Client.Client,
  options: setBlockGasLimit.Options,
): Promise<void> {
  const { gasLimit, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_setBlockGasLimit`,
    params: [Hex.fromNumber(gasLimit)],
  })
}

export declare namespace setBlockGasLimit {
  type Options = {
    /** Gas limit (in wei). */
    gasLimit: bigint
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
