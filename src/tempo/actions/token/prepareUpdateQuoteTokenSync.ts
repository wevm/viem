import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import {
  prepareUpdateQuoteToken,
  type PrepareUpdateQuoteTokenEvent,
} from './prepareUpdateQuoteToken.js'

/**
 * Prepares a quote token update for a TIP-20 token, and waits for the
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
 * const { receipt, ...event } = await Actions.token.prepareUpdateQuoteTokenSync(client, {
 *   quoteToken: '0x20c0000000000000000000000000000000000002',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function prepareUpdateQuoteTokenSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: prepareUpdateQuoteTokenSync.Options,
): Promise<prepareUpdateQuoteTokenSync.ReturnType> {
  const receipt = await prepareUpdateQuoteToken.inner(
    writeSync,
    client,
    options,
  )
  const { args } = prepareUpdateQuoteToken.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace prepareUpdateQuoteTokenSync {
  export type Args = prepareUpdateQuoteToken.Args
  export type Options = prepareUpdateQuoteToken.Options & WriteSyncParameters
  export type ReturnType = PrepareUpdateQuoteTokenEvent & {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
