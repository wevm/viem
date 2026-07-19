import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { updateLimit } from './updateLimit.js'

/**
 * Updates the spending limit for a specific token on an authorized access key,
 * and waits for the transaction to be confirmed.
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
 * const { limit } = await Actions.accessKey.updateLimitSync(client, {
 *   accessKey: '0x…',
 *   token: '0x…',
 *   limit: 1000000000000000000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function updateLimitSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: updateLimitSync.Options,
): Promise<updateLimitSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await updateLimit.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = updateLimit.extractEvent(receipt.logs)
  return {
    account: args.account,
    limit: args.newLimit,
    publicKey: args.publicKey,
    token: args.token,
    receipt,
  }
}

export namespace updateLimitSync {
  export type Args = updateLimit.Args
  export type Options = updateLimit.Options & WriteSyncParameters
  export type ReturnType = {
    /** Account that owns the key. */
    account: Address.Address
    /** New spending limit. */
    limit: bigint
    /** Access key address. */
    publicKey: Address.Address
    /** Token address. */
    token: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
