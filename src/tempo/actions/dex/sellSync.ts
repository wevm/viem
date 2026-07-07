import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { sell } from './sell.js'

/**
 * Sells a specific amount of tokens., and waits for the transaction to be confirmed.
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
 * const result = await Actions.dex.sellSync(client, {
 *   tokenIn: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function sellSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: sellSync.Options,
): Promise<sellSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await sell.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace sellSync {
  export type Args = sell.Args
  export type Options = sell.Options
  export type ReturnType = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
