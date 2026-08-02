import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { setAdmin } from './setAdmin.js'

/** Sets the admin for a TIP-403 transfer policy, and waits for the transaction to be confirmed. */
export async function setAdminSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setAdminSync.Options,
): Promise<setAdminSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await setAdmin.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = setAdmin.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace setAdminSync {
  export type Args = setAdmin.Args
  export type Options = setAdmin.Options & WriteSyncParameters
  export type ReturnType = {
    /** Policy ID. */
    policyId: bigint
    /** Address that updated the admin. */
    updater: Address.Address
    /** New admin address. */
    admin: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
