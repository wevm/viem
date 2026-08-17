import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { pause, type PauseStateUpdate } from './pause.js'

/** Pauses a TIP-20 token, and waits for the transaction to be confirmed. */
export async function pauseSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: pauseSync.Options,
): Promise<pauseSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await pause.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = pause.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace pauseSync {
  export type Args = pause.Args
  export type Options = pause.Options & WriteSyncParameters
  export type ReturnType = PauseStateUpdate & {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
