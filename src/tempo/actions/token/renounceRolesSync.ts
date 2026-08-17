import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { renounceRoles, type RoleMembershipUpdated } from './renounceRoles.js'

/**
 * Renounces roles for a TIP-20 token, and waits for the transaction to be confirmed.
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
 * const { receipt, value } = await Actions.token.renounceRolesSync(client, {
 *   roles: ['issuer'],
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function renounceRolesSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: renounceRolesSync.Options,
): Promise<renounceRolesSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await renounceRoles.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const events = renounceRoles.extractEvents(receipt.logs)
  const value = events.map((event) => event.args)
  return { receipt, value }
}

export namespace renounceRolesSync {
  export type Args = renounceRoles.Args
  export type Options = renounceRoles.Options & WriteSyncParameters
  export type ReturnType = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
    /** Role membership update events. */
    value: readonly RoleMembershipUpdated[]
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
