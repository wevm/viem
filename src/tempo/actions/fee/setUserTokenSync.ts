import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { setUserToken } from './setUserToken.js'

/**
 * Sets the calling account's default fee token, and waits for the
 * transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.fee.setUserTokenSync(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function setUserTokenSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setUserTokenSync.Options,
): Promise<setUserTokenSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await setUserToken.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = setUserToken.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace setUserTokenSync {
  export type Args = setUserToken.Args
  export type Options = setUserToken.Options & WriteSyncParameters
  export type ReturnType = {
    /** Token set as the account's default fee token. */
    token: Address.Address
    /** Account the fee token was set for. */
    user: Address.Address

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
