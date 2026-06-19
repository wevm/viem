import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Change the minimum gas price accepted by the network (in wei).
 *
 * Note: `setMinGasPrice` can only be used on clients that do not have EIP-1559
 * enabled.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * await Actions.test.setMinGasPrice(client, { gasPrice: 1_000_000_000n })
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
