import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { changeStatus } from './changeStatus.js'

/** Changes validator active status, and waits for the transaction to be confirmed. */
export async function changeStatusSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeStatusSync.Options,
): Promise<changeStatusSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await changeStatus.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  return { receipt }
}

export namespace changeStatusSync {
  export type Args = changeStatus.Args
  export type Options = changeStatus.Options
  export type ReturnType = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
