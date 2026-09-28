import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { changeOwner } from './changeOwner.js'

/** Changes the owner of the validator config precompile, and waits for the transaction to be confirmed. */
export async function changeOwnerSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeOwnerSync.Options,
): Promise<changeOwnerSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await changeOwner.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  return { receipt }
}

export namespace changeOwnerSync {
  export type Args = changeOwner.Args
  export type Options = changeOwner.Options & WriteSyncParameters
  export type ReturnType = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
