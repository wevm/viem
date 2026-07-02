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
 * Gets the total supply of an ERC-20 token.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 *
 * const totalSupply = await Actions.token.getTotalSupply(client, {
 *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token total supply, in base units and human-readable form.
 */
export async function getTotalSupply<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  tokens extends Token.Tokens | undefined = undefined,
>(
  client: Client.Client<chain, account, Transport.Transport, tokens>,
  options: getTotalSupply.Options<chain, tokens>,
): Promise<getTotalSupply.ReturnType> {
  const { decimals, token, ...rest } = options
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getTotalSupply.call(client, { token } as never),
    }),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getTotalSupply {
  export type Args<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = TokenParameters<chain, tokens>
  export type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = Omit<ReadParameters, 'account'> & Args<chain, tokens>
  export type ReturnType = Amount

  /**
   * Defines a call to the `totalSupply` function.
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
    args: getTotalSupply.Args<chain, tokens>,
  ) {
    return defineCall({
      abi: erc20Abi,
      address: resolveToken(client, args).address,
      args: [],
      functionName: 'totalSupply',
    })
  }
}
