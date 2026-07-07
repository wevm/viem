import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { rebalanceSwap } from './rebalanceSwap.js'

/**
 * Performs a rebalance swap from validator token to user token, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.amm.rebalanceSwapSync(client, {
 *   userToken: '0x20c0000000000000000000000000000000000001',
 *   validatorToken: '0x20c0000000000000000000000000000000000002',
 * } as never)
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function rebalanceSwapSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: rebalanceSwapSync.Options,
): Promise<rebalanceSwapSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await rebalanceSwap.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = rebalanceSwap.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace rebalanceSwapSync {
  export type Args = rebalanceSwap.Args
  export type Options = rebalanceSwap.Options
  export type ReturnType = {
    /** User token address. */
    userToken: Address.Address
    /** Validator token address. */
    validatorToken: Address.Address
    /** Address that performed the swap. */
    swapper: Address.Address
    /** Amount of validator token spent. */
    amountIn: bigint
    /** Amount of user token received. */
    amountOut: bigint

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
