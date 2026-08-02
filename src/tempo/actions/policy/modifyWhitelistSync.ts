import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { modifyWhitelist } from './modifyWhitelist.js'

/** Modifies a TIP-403 transfer policy whitelist, and waits for the transaction to be confirmed. */
export async function modifyWhitelistSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: modifyWhitelistSync.Options,
): Promise<modifyWhitelistSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await modifyWhitelist.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = modifyWhitelist.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace modifyWhitelistSync {
  export type Args = modifyWhitelist.Args
  export type Options = modifyWhitelist.Options & WriteSyncParameters
  export type ReturnType = {
    /** Policy ID. */
    policyId: bigint
    /** Address that updated the whitelist. */
    updater: Address.Address
    /** Target account address. */
    account: Address.Address
    /** Whether the account is allowed. */
    allowed: boolean
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
