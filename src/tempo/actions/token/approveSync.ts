import { Value } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { resolveAmountDecimals } from '../../../core/actions/token/internal.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { resolveToken } from '../../internal/utils.js'
import { approve } from './approve.js'

/**
 * Approves a spender to transfer TIP-20 tokens on behalf of the caller, and
 * waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.approveSync(client, {
 *   amount: 100n,
 *   spender: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function approveSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: approveSync.Options,
): Promise<approveSync.ReturnType> {
  const { amount, token, throwOnReceiptRevert = true } = options
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await approve.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = approve.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: Value.format(args.amount, resolved) }),
    receipt,
  }
}

export namespace approveSync {
  export type Args = approve.Args
  export type Options = approve.Options & WriteSyncParameters
  export type ReturnType = {
    /** Owner that approved the spender. */
    owner: Address.Address
    /** Spender approved to transfer the tokens. */
    spender: Address.Address
    /** Approved amount, in base units. */
    amount: bigint
    /** Token decimals used to derive `formatted`, if known. */
    decimals?: number | undefined
    /** Approved amount formatted with the token's `decimals`, if known. */
    formatted?: string | undefined
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
