import type * as Address from 'ox/Address'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type * as Token from '../../Token.js'
import type * as Transport from '../../Transport.js'
import { read } from '../contract/read.js'
import { erc20Abi } from './internal/abi.js'
import {
  type Amount,
  defineCall,
  type ReadParameters,
  resolveToken,
  resolveTokenWithDecimals,
  type TokenParameters,
  toAmount,
} from './internal.js'

/**
 * Gets the ERC-20 allowance a spender has over an account's tokens.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 *
 * const allowance = await Actions.token.getAllowance(client, {
 *   account: '0x…',
 *   spender: '0x…',
 *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The allowance, in base units and human-readable form.
 */
export async function getAllowance<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  tokens extends Token.Tokens | undefined = undefined,
>(
  client: Client.Client<chain, account, Transport.Transport, tokens>,
  options: getAllowance.Options<chain, tokens>,
): Promise<getAllowance.ReturnType> {
  const { account, decimals, spender, token, ...rest } = options
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getAllowance.call(client, { account, spender, token } as never),
    }),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getAllowance {
  export type Args<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = {
    /** Account that owns the tokens. */
    account: Address.Address
    /** Spender of the tokens. */
    spender: Address.Address
  } & TokenParameters<chain, tokens>
  export type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = ReadParameters & Args<chain, tokens>
  export type ReturnType = Amount

  /**
   * Defines a call to the `allowance` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token` symbol (resolved from the client's `tokens` array) or
   * contract address.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
    tokens extends Token.Tokens | undefined = undefined,
  >(
    client: Client.Client<chain, account, Transport.Transport, tokens>,
    args: getAllowance.Args<chain, tokens>,
  ) {
    return defineCall({
      abi: erc20Abi,
      address: resolveToken(client, args).address,
      args: [args.account, args.spender],
      functionName: 'allowance',
    })
  }
}
