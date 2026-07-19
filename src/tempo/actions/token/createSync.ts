import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { create } from './create.js'

/**
 * Creates a new TIP-20 token, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.createSync(client, {
 *   currency: 'USD',
 *   logoURI: 'https://example.com/token.svg',
 *   name: 'My Token',
 *   symbol: 'MTK',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function createSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: createSync.Options<account>,
): Promise<createSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await create.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = create.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace createSync {
  export type Args = create.Args
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = create.Options<account> & WriteSyncParameters
  export type ReturnType = {
    /** Created token address. */
    token: Address.Address
    /** Token name. */
    name: string
    /** Token symbol. */
    symbol: string
    /** Currency (e.g. "USD"). */
    currency: string
    /** Quote token address. */
    quoteToken: Address.Address
    /** Admin address. */
    admin: Address.Address
    /** Unique salt. */
    salt: Hex.Hex
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
