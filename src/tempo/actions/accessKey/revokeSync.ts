import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { revoke } from './revoke.js'

/**
 * Revokes an authorized access key, and waits for the transaction to be
 * confirmed.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const { publicKey } = await Actions.accessKey.revokeSync(client, {
 *   accessKey: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function revokeSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: revokeSync.Options,
): Promise<revokeSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await revoke.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = revoke.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace revokeSync {
  export type Args = revoke.Args
  export type Options = revoke.Options & WriteSyncParameters
  export type ReturnType = {
    /** Account the key was revoked on. */
    account: Address.Address
    /** Revoked access key address. */
    publicKey: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
