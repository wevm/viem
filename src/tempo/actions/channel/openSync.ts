import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { open } from './open.js'

/** Opens and funds a TIP-20 channel reserve channel and waits for the transaction receipt. */
export async function openSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: openSync.Options,
): Promise<openSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await open.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = open.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace openSync {
  export type Args = open.Args
  export type Options = open.Options
  export type ReturnType = {
    /** Channel ID. */
    channelId: Hex.Hex
    /** Channel payer. */
    payer: Address.Address
    /** Channel payee. */
    payee: Address.Address
    /** Channel operator. */
    operator: Address.Address
    /** Token address. */
    token: Address.Address
    /** Authorized voucher signer. */
    authorizedSigner: Address.Address
    /** Channel salt. */
    salt: Hex.Hex
    /** Expiring nonce hash. */
    expiringNonceHash: Hex.Hex
    /** Initial deposit. */
    deposit: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
