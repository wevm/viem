import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { modifyBlacklist } from './modifyBlacklist.js'

/** Modifies a TIP-403 transfer policy blacklist, and waits for the transaction to be confirmed. */
export async function modifyBlacklistSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: modifyBlacklistSync.Options,
): Promise<modifyBlacklistSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await modifyBlacklist.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = modifyBlacklist.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace modifyBlacklistSync {
  export type Args = modifyBlacklist.Args
  export type Options = modifyBlacklist.Options & WriteSyncParameters
  export type ReturnType = {
    /** Policy ID. */
    policyId: bigint
    /** Address that updated the blacklist. */
    updater: Address.Address
    /** Target account address. */
    account: Address.Address
    /** Whether the account is restricted. */
    restricted: boolean
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
