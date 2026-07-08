import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { requestClose } from './requestClose.js'

/** Starts the payer close timer and waits for the transaction receipt. */
export async function requestCloseSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: requestCloseSync.Options,
): Promise<requestCloseSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await requestClose.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = requestClose.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace requestCloseSync {
  export type Args = requestClose.Args
  export type Options = requestClose.Options
  export type ReturnType = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Channel payer. */
    payer: Address.Address
    /** Channel payee. */
    payee: Address.Address
    /** Close grace period end timestamp. */
    closeGraceEnd: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
