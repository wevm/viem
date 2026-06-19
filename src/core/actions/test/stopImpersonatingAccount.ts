import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Stop impersonating an account after having previously used
 * `impersonateAccount`.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * await Actions.test.stopImpersonatingAccount(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 * })
 * ```
 */
export async function stopImpersonatingAccount(
  client: Client.Client,
  options: stopImpersonatingAccount.Options,
): Promise<void> {
  const { address, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_stopImpersonatingAccount`,
    params: [address],
  })
}

export declare namespace stopImpersonatingAccount {
  type Options = {
    /** The account to stop impersonating. */
    address: Address.Address
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
