import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Value from 'ox/Value'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { resolveAmountDecimals } from '../../../core/actions/token/internal.js'
import { resolveToken } from '../../internal/utils.js'
import { burn } from './burn.js'

/**
 * Burns TIP-20 tokens from the caller's balance, and waits for the transaction
 * to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.burnSync(client, {
 *   amount: 100n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function burnSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnSync.Options,
): Promise<burnSync.ReturnType> {
  const { amount, token, throwOnReceiptRevert = true } = options
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await burn.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = burn.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: Value.format(args.amount, resolved) }),
    receipt,
  } as never
}

export namespace burnSync {
  export type Args = burn.Args
  export type Options = burn.Options
  export type ReturnType = {
    /** Address tokens were burned from. */
    from: Address.Address
    /** Burned amount, in base units. */
    amount: bigint
    /** Token decimals used to derive `formatted`, if known. */
    decimals?: number | undefined
    /** Burned amount formatted with the token's `decimals`, if known. */
    formatted?: string | undefined
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
