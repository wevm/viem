import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { add } from './add.js'

/** Adds a new validator, and waits for the transaction to be confirmed. */
export async function addSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: addSync.Options,
): Promise<addSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await add.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  return { receipt }
}

export namespace addSync {
  export type Args = add.Args
  export type Options = add.Options & WriteSyncParameters
  export type ReturnType = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
