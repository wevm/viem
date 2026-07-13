import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import { authorize } from './authorize.js'

/**
 * Authorizes an access key and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { P256 } from 'viem/utils'
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x…')
 * const client = Client.create({
 *   account,
 *   transport: http(),
 * })
 *
 * const accessKey = Account.fromP256(P256.randomPrivateKey(), {
 *   access: account,
 * })
 *
 * const { receipt, ...event } = await Actions.accessKey.authorizeSync(client, {
 *   accessKey,
 *   expiry: Math.floor((Date.now() + 30_000) / 1000),
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function authorizeSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: authorizeSync.Options,
): Promise<authorizeSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await authorize.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = authorize.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace authorizeSync {
  export type Args = authorize.Args
  export type Options = authorize.Options
  export type ReturnType = {
    /** Account the key was authorized on. */
    account: Address.Address
    /** Unix timestamp when the key expires. */
    expiry: bigint
    /** Access key address. */
    publicKey: Address.Address
    /** Signature scheme identifier. */
    signatureType: number
    /** Transaction receipt. */
    receipt: sendSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
