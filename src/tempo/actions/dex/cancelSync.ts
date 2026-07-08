import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { cancel } from './cancel.js'

/**
 * Cancels an order from the orderbook, and waits for the transaction to be confirmed.
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
 * const result = await Actions.dex.cancelSync(client, {
 *   orderId: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function cancelSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: cancelSync.Options,
): Promise<cancelSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await cancel.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = cancel.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace cancelSync {
  export type Args = cancel.Args
  export type Options = cancel.Options
  export type ReturnType = {
    /** Cancelled order ID. */
    orderId: bigint

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
