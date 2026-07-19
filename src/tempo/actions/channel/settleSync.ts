import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { settle } from './settle.js'

/** Settles a TIP-20 channel reserve voucher and waits for the transaction receipt. */
export async function settleSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: settleSync.Options,
): Promise<settleSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await settle.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = settle.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace settleSync {
  export type Args = settle.Args
  export type Options = settle.Options & WriteSyncParameters
  export type ReturnType = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Channel payer. */
    payer: Address.Address
    /** Channel payee. */
    payee: Address.Address
    /** Total voucher amount. */
    cumulativeAmount: bigint
    /** Amount paid by this settlement. */
    deltaPaid: bigint
    /** New settled amount. */
    newSettled: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
