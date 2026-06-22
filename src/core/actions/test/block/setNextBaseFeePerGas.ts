import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../../Client.js'
import type * as Mode from '../internal/mode.js'
import { request } from '../internal/request.js'

/**
 * Sets the next block's base fee per gas.
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
 * await Actions.test.block.setNextBaseFeePerGas(client, { baseFeePerGas: 1_000_000_000n })
 * ```
 */
export async function setNextBaseFeePerGas(
  client: Client.Client,
  options: setNextBaseFeePerGas.Options,
): Promise<void> {
  const { baseFeePerGas, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_setNextBlockBaseFeePerGas`,
    params: [Hex.fromNumber(baseFeePerGas)],
  })
}

export declare namespace setNextBaseFeePerGas {
  type Options = {
    /** Base fee per gas (in wei). */
    baseFeePerGas: bigint
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
