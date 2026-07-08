import { Value } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { resolveAmountDecimals } from '../../../core/actions/token/internal.js'
import { resolveToken } from '../../internal/utils.js'
import { burnBlocked } from './burnBlocked.js'

/**
 * Burns TIP-20 tokens from a blocked address, and waits for the transaction to
 * be confirmed.
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
 * const { receipt, ...event } = await Actions.token.burnBlockedSync(client, {
 *   amount: 100n,
 *   from: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function burnBlockedSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnBlockedSync.Options,
): Promise<burnBlockedSync.ReturnType> {
  const { amount, token, throwOnReceiptRevert = true } = options
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await burnBlocked.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = burnBlocked.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: Value.format(args.amount, resolved) }),
    receipt,
  }
}

export namespace burnBlockedSync {
  export type Args = burnBlocked.Args
  export type Options = burnBlocked.Options
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
