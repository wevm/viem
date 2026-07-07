import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { close } from './close.js'

/** Closes a TIP-20 channel reserve channel and waits for the transaction receipt. */
export async function closeSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: closeSync.Options,
): Promise<closeSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await close.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = close.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace closeSync {
  export type Args = close.Args
  export type Options = close.Options
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
