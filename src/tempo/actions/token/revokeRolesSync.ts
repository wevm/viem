import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import { revokeRoles, type RoleMembershipUpdated } from './revokeRoles.js'

/**
 * Revokes roles for a TIP-20 token, and waits for the transaction to be confirmed.
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
 * const { receipt, value } = await Actions.token.revokeRolesSync(client, {
 *   roles: ['issuer'],
 *   from: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function revokeRolesSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: revokeRolesSync.Options,
): Promise<revokeRolesSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await revokeRoles.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const events = revokeRoles.extractEvents(receipt.logs)
  const value = events.map((event) => event.args)
  return { receipt, value } as never
}

export namespace revokeRolesSync {
  export type Args = revokeRoles.Args
  export type Options = revokeRoles.Options
  export type ReturnType = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
    /** Role membership update events. */
    value: readonly RoleMembershipUpdated[]
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
