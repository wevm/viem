import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Value from 'ox/Value'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type * as Token from '../../Token.js'
import type * as Transport from '../../Transport.js'
import type { writeSync } from '../contract/writeSync.js'
import { writeSync as writeContractSync } from '../contract/writeSync.js'
import { approve } from './approve.js'
import { resolveAmountDecimals, resolveToken } from './internal.js'

/**
 * Approves a spender to transfer ERC-20 tokens on behalf of the caller, and
 * waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await Actions.token.approveSync(client, {
 *   amount: 100000000n,
 *   spender: '0x…',
 *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
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
  tokens extends Token.Tokens | undefined = undefined,
>(
  client: Client.Client<chain, account, Transport.Transport, tokens>,
  options: approveSync.Options<chain, account, tokens>,
): Promise<approveSync.ReturnType<chain>> {
  const { amount, token, throwOnReceiptRevert = true } = options
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await approve.inner(writeContractSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = approve.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: Value.format(args.value, resolved) }),
    receipt,
  } as never
}

export namespace approveSync {
  export type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = approve.Options<chain, account, tokens>
  export type Args<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = approve.Args<chain, tokens>
  export type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Owner that approved the spender. */
    owner: Address.Address
    /** Spender approved to transfer the tokens. */
    spender: Address.Address
    /** Approved amount, in base units. */
    value: bigint
    /** Token decimals used to derive `formatted`, if known. */
    decimals?: number | undefined
    /** Approved amount formatted with the token's `decimals`, if known. */
    formatted?: string | undefined
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
