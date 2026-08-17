import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { mint } from './mint.js'

/**
 * Adds liquidity to a pool, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.amm.mintSync(client, {
 *   userToken: '0x20c0000000000000000000000000000000000001',
 *   validatorToken: '0x20c0000000000000000000000000000000000002',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function mintSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: mintSync.Options,
): Promise<mintSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await mint.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = mint.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace mintSync {
  export type Args = mint.Args
  export type Options = mint.Options & WriteSyncParameters
  export type ReturnType = {
    /** Address that added liquidity. */
    sender: Address.Address
    /** Address that received LP tokens. */
    to: Address.Address
    /** User token address. */
    userToken: Address.Address
    /** Validator token address. */
    validatorToken: Address.Address
    /** Amount of validator token added. */
    amountValidatorToken: bigint
    /** Amount of LP tokens minted. */
    liquidity: bigint

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
