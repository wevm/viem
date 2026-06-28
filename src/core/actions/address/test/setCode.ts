import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Modifies the bytecode stored at an account's address.
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
 * await Actions.test.address.setCode(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 *   bytecode: '0x60806040...',
 * })
 * ```
 */
export async function setCode(
  client: Client.Client,
  options: setCode.Options,
): Promise<void> {
  const { address, bytecode, mode = 'anvil' } = options
  if (mode === 'ganache')
    await request(client)({
      method: 'evm_setAccountCode',
      params: [address, bytecode],
    })
  else
    await request(client)({
      method: `${mode}_setCode`,
      params: [address, bytecode],
    })
}

export declare namespace setCode {
  type Options = {
    /** The account address. */
    address: Address.Address
    /** The bytecode to set. */
    bytecode: Hex.Hex
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
