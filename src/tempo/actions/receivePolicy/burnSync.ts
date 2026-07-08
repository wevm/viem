import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { burn } from './burn.js'

type BurnEvent = ReturnType<typeof burn.extractEvent>

/** Burns the funds backing a blocked receipt and waits for the transaction to be confirmed. */
export async function burnSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnSync.Options,
): Promise<burnSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await burn.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = burn.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace burnSync {
  export type Args = burn.Args
  export type Options = burn.Options
  export type ReturnType = BurnEvent['args'] & {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
