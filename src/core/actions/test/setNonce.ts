import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Modifies (overrides) the nonce of an account.
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
 * await Actions.test.setNonce(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 *   nonce: 420,
 * })
 * ```
 */
export async function setNonce(
  client: Client.Client,
  options: setNonce.Options,
): Promise<void> {
  const { address, mode = 'anvil', nonce } = options
  await request(client)({
    method: `${mode}_setNonce`,
    params: [address, Hex.fromNumber(nonce)],
  })
}

export declare namespace setNonce {
  type Options = {
    /** The account address. */
    address: Address.Address
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
    /** The nonce to set. */
    nonce: number
  }
  type ErrorType = Errors.GlobalErrorType
}
