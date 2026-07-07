import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { setNextFullDkgCeremony } from './setNextFullDkgCeremony.js'

/** Sets the next epoch for a full DKG ceremony, and waits for the transaction to be confirmed. */
export async function setNextFullDkgCeremonySync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setNextFullDkgCeremonySync.Options,
): Promise<setNextFullDkgCeremonySync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await setNextFullDkgCeremony.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  return { receipt }
}

export namespace setNextFullDkgCeremonySync {
  export type Args = setNextFullDkgCeremony.Args
  export type Options = setNextFullDkgCeremony.Options
  export type ReturnType = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
