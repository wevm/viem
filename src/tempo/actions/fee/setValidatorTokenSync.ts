import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { setValidatorToken } from './setValidatorToken.js'

/**
 * Sets the calling validator's preferred fee token, and waits for the
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
 * const { receipt, ...event } = await Actions.fee.setValidatorTokenSync(
 *   client,
 *   { token: '0x20c0000000000000000000000000000000000001' },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function setValidatorTokenSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setValidatorTokenSync.Options,
): Promise<setValidatorTokenSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await setValidatorToken.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = setValidatorToken.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace setValidatorTokenSync {
  export type Args = setValidatorToken.Args
  export type Options = setValidatorToken.Options & WriteSyncParameters
  export type ReturnType = {
    /** Token set as the validator's preferred fee token. */
    token: Address.Address
    /** Validator the fee token was set for. */
    validator: Address.Address

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
