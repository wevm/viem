import type { Address, Errors } from 'ox'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Impersonate an account or contract address. This lets you send transactions
 * from that account even if you don't have access to its private key.
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
 * await Actions.address.impersonate(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 * })
 * ```
 */
export async function impersonate(
  client: Client.Client,
  options: impersonate.Options,
): Promise<void> {
  const { address, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_impersonateAccount`,
    params: [address],
  })
}

export declare namespace impersonate {
  type Options = {
    /** The account to impersonate. */
    address: Address.Address
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
