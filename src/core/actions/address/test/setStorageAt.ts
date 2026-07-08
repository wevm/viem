import { Hex } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Writes to a slot of an account's storage.
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
 * await Actions.test.address.setStorageAt(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 *   index: 2,
 *   value: '0x0000000000000000000000000000000000000000000000000000000000000069',
 * })
 * ```
 */
export async function setStorageAt(
  client: Client.Client,
  options: setStorageAt.Options,
): Promise<void> {
  const { address, index, mode = 'anvil', value } = options
  await request(client)({
    method: `${mode}_setStorageAt`,
    params: [
      address,
      typeof index === 'number' ? Hex.fromNumber(index) : index,
      value,
    ],
  })
}

export declare namespace setStorageAt {
  type Options = {
    /** The account address. */
    address: Address.Address
    /** The storage slot (index). Can either be a number or hash value. */
    index: number | Hex.Hex
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
    /** The value to store as a 32 byte hex string. */
    value: Hex.Hex
  }
  type ErrorType = Errors.GlobalErrorType
}
