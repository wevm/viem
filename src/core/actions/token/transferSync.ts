import { Value } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type * as Token from '../../Token.js'
import type * as Transport from '../../Transport.js'
import type { writeSync } from '../contract/writeSync.js'
import { writeSync as writeContractSync } from '../contract/writeSync.js'
import { resolveAmountDecimals, resolveToken } from './internal.js'
import { transfer } from './transfer.js'

/**
 * Transfers ERC-20 tokens to another address, and waits for the transaction to
 * be confirmed.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`).
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
 * const { receipt, ...event } = await Actions.token.transferSync(client, {
 *   amount: 100000000n,
 *   to: '0x…',
 *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function transferSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  tokens extends Token.Tokens | undefined = undefined,
>(
  client: Client.Client<chain, account, Transport.Transport, tokens>,
  options: transferSync.Options<chain, account, tokens>,
): Promise<transferSync.ReturnType<chain>> {
  const { amount, token, throwOnReceiptRevert = true } = options
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await transfer.inner(writeContractSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = transfer.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: Value.format(args.value, resolved) }),
    receipt,
  } as never
}

export namespace transferSync {
  export type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = transfer.Options<chain, account, tokens>
  export type Args<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = transfer.Args<chain, tokens>
  export type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address the tokens were transferred from. */
    from: Address.Address
    /** Address the tokens were transferred to. */
    to: Address.Address
    /** Transferred amount, in base units. */
    value: bigint
    /** Token decimals used to derive `formatted`, if known. */
    decimals?: number | undefined
    /** Transferred amount formatted with the token's `decimals`, if known. */
    formatted?: string | undefined
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
