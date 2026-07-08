import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { topUp } from './topUp.js'

/** Adds deposit to a TIP-20 channel reserve channel and waits for the transaction receipt. */
export async function topUpSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: topUpSync.Options,
): Promise<topUpSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await topUp.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = topUp.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace topUpSync {
  export type Args = topUp.Args
  export type Options = topUp.Options
  export type ReturnType = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Channel payer. */
    payer: Address.Address
    /** Channel payee. */
    payee: Address.Address
    /** Additional deposit. */
    additionalDeposit: bigint
    /** New total deposit. */
    newDeposit: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
