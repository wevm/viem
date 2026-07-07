import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { cancelStale } from './cancelStale.js'

/**
 * Cancels a stale order from the orderbook., and waits for the transaction to be confirmed.
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
 * const result = await Actions.dex.cancelStaleSync(client, {
 *   orderId: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function cancelStaleSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: cancelStaleSync.Options,
): Promise<cancelStaleSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await cancelStale.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = cancelStale.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace cancelStaleSync {
  export type Args = cancelStale.Args
  export type Options = cancelStale.Options
  export type ReturnType = {
    /** Cancelled order ID. */
    orderId: bigint

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
