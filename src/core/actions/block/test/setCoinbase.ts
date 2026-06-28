import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Sets the coinbase address to be used in new blocks.
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
 * await Actions.test.block.setCoinbase(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 * })
 * ```
 */
export async function setCoinbase(
  client: Client.Client,
  options: setCoinbase.Options,
): Promise<void> {
  const { address, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_setCoinbase`,
    params: [address],
  })
}

export declare namespace setCoinbase {
  type Options = {
    /** The coinbase address. */
    address: Address.Address
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
