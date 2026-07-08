import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { claim } from './claim.js'

type ClaimEvent = ReturnType<typeof claim.extractEvent>

/** Claims blocked funds for a receipt and waits for the transaction to be confirmed. */
export async function claimSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: claimSync.Options,
): Promise<claimSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await claim.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = claim.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace claimSync {
  export type Args = claim.Args
  export type Options = claim.Options
  export type ReturnType = ClaimEvent['args'] & {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
