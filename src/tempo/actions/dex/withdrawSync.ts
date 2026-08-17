import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { withdraw } from './withdraw.js'

/**
 * Withdraws tokens from the DEX to the caller's wallet, and waits for the transaction to be confirmed.
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
 * const result = await Actions.dex.withdrawSync(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
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
  return { receipt }
}

export namespace withdrawSync {
  export type Args = withdraw.Args
  export type Options = withdraw.Options & WriteSyncParameters
  export type ReturnType = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
