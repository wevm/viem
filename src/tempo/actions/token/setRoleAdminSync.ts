import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { setRoleAdmin } from './setRoleAdmin.js'

/**
 * Sets the admin role for a specific role in a TIP-20 token, and waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await Actions.token.setRoleAdminSync(client, {
 *   adminRole: 'admin',
 *   role: 'issuer',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function setRoleAdminSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setRoleAdminSync.Options,
): Promise<setRoleAdminSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await setRoleAdmin.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = setRoleAdmin.extractEvent(receipt.logs)
  return {
    ...args,

    receipt,
  } as never
}

export namespace setRoleAdminSync {
  export type Args = setRoleAdmin.Args
  export type Options = setRoleAdmin.Options
  export type ReturnType = {
    /** Role whose admin role was updated. */
    role: Hex.Hex
    /** New admin role. */
    newAdminRole: Hex.Hex
    /** Address that updated the admin role. */
    sender: Address.Address

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
