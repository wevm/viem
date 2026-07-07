import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { burn } from './burn.js'

/**
 * Removes liquidity from a pool, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.amm.burnSync(client, {
 *   userToken: '0x20c0000000000000000000000000000000000001',
 *   validatorToken: '0x20c0000000000000000000000000000000000002',
 * } as never)
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function burnSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnSync.Options,
): Promise<burnSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await burn.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = burn.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace burnSync {
  export type Args = burn.Args
  export type Options = burn.Options
  export type ReturnType = {
    /** Address that removed liquidity. */
    sender: Address.Address
    /** User token address. */
    userToken: Address.Address
    /** Validator token address. */
    validatorToken: Address.Address
    /** Amount of user token returned. */
    amountUserToken: bigint
    /** Amount of validator token returned. */
    amountValidatorToken: bigint
    /** Amount of LP tokens burned. */
    liquidity: bigint
    /** Address that received tokens. */
    to: Address.Address

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
