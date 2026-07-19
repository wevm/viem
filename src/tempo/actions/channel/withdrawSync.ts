import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { withdraw } from './withdraw.js'

/** Withdraws payer funds after the close grace period elapses and waits for the transaction receipt. */
export async function withdrawSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: withdrawSync.Options,
): Promise<withdrawSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await withdraw.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = withdraw.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace withdrawSync {
  export type Args = withdraw.Args
  export type Options = withdraw.Options & WriteSyncParameters
  export type ReturnType = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Channel payer. */
    payer: Address.Address
    /** Channel payee. */
    payee: Address.Address
    /** Amount settled to the payee. */
    settledToPayee: bigint
    /** Amount refunded to the payer. */
    refundedToPayer: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
