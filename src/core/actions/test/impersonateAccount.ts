import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

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
 * await Actions.test.impersonateAccount(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 * })
 * ```
 */
export async function impersonateAccount(
  client: Client.Client,
  options: impersonateAccount.Options,
): Promise<void> {
  const { address, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_impersonateAccount`,
    params: [address],
  })
}

export declare namespace impersonateAccount {
  type Options = {
    /** The account to impersonate. */
    address: Address.Address
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
