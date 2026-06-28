import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Modifies the balance of an account.
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
 * await Actions.test.address.setBalance(client, {
 *   address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
 *   value: 1_000_000_000_000_000_000n,
 * })
 * ```
 */
export async function setBalance(
  client: Client.Client,
  options: setBalance.Options,
): Promise<void> {
  const { address, mode = 'anvil', value } = options
  if (mode === 'ganache')
    await request(client)({
      method: 'evm_setAccountBalance',
      params: [address, Hex.fromNumber(value)],
    })
  else
    await request(client)({
      method: `${mode}_setBalance`,
      params: [address, Hex.fromNumber(value)],
    })
}

export declare namespace setBalance {
  type Options = {
    /** The account address. */
    address: Address.Address
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
    /** Amount (in wei) to set. */
    value: bigint
  }
  type ErrorType = Errors.GlobalErrorType
}
