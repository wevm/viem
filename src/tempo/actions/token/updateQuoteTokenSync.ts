import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import {
  updateQuoteToken,
  type UpdateQuoteTokenEvent,
} from './updateQuoteToken.js'

/**
 * Completes a prepared quote token update for a TIP-20 token, and waits for
 * the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.updateQuoteTokenSync(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function updateQuoteTokenSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: updateQuoteTokenSync.Options,
): Promise<updateQuoteTokenSync.ReturnType> {
  const receipt = await updateQuoteToken.inner(writeSync, client, options)
  const { args } = updateQuoteToken.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace updateQuoteTokenSync {
  export type Args = updateQuoteToken.Args
  export type Options = updateQuoteToken.Options
  export type ReturnType = UpdateQuoteTokenEvent & {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
