import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { place } from './place.js'

/**
 * Places a limit order on the orderbook., and waits for the transaction to be confirmed.
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
 * const result = await Actions.dex.placeSync(client, {
 *   amount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function placeSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: placeSync.Options,
): Promise<placeSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await place.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = place.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace placeSync {
  export type Args = place.Args
  export type Options = place.Options
  export type ReturnType = {
    /** Order ID. */
    orderId: bigint
    /** Order maker. */
    maker: `0x${string}`
    /** Base token. */
    token: Address.Address
    /** Order amount. */
    amount: bigint
    /** Whether the order is a bid. */
    isBid: boolean
    /** Price tick. */
    tick: number
    /** Whether the order is a flip order. */
    isFlipOrder: boolean
    /** Flip tick. */
    flipTick: number

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
