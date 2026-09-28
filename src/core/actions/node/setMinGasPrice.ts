import { Hex } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../Client.js'
import type * as Mode from '../internal/test/mode.js'
import { request } from '../internal/test/request.js'

/**
 * Change the minimum gas price accepted by the network (in wei).
 *
 * Note: `setMinGasPrice` can only be used on clients that do not have EIP-1559
 * enabled.
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
 * await Actions.node.setMinGasPrice(client, { gasPrice: 1_000_000_000n })
 * ```
 */
export async function setMinGasPrice(
  client: Client.Client,
  options: setMinGasPrice.Options,
): Promise<void> {
  const { gasPrice, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_setMinGasPrice`,
    params: [Hex.fromNumber(gasPrice)],
  })
}

export declare namespace setMinGasPrice {
  type Options = {
    /** The gas price (in wei). */
    gasPrice: bigint
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
