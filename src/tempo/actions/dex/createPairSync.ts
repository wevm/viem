import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { createPair } from './createPair.js'

/**
 * Creates a new trading pair on the DEX, and waits for the transaction to be confirmed.
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
 * const result = await Actions.dex.createPairSync(client, {
 *   base: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function createPairSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: createPairSync.Options,
): Promise<createPairSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await createPair.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = createPair.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace createPairSync {
  export type Args = createPair.Args
  export type Options = createPair.Options
  export type ReturnType = {
    /** Pair key. */
    key: `0x${string}`
    /** Base token. */
    base: Address.Address
    /** Quote token. */
    quote: Address.Address

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
