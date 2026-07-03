import type * as Address from 'ox/Address'

import * as Account from '../../Account.js'
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
 * Gets the ERC-20 token balance of an account.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 *
 * const balance = await Actions.token.getBalance(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token balance, in base units and human-readable form.
 */
export async function getBalance<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  tokens extends Token.Tokens | undefined = undefined,
>(
  client: Client.Client<chain, account, Transport.Transport, tokens>,
  options: getBalance.Options<chain, account, tokens>,
): Promise<getBalance.ReturnType> {
  const {
    account: account_ = client.account,
    decimals,
    token,
    ...rest
  } = options
  if (!account_) throw new Account.NotFoundError()
  const address = typeof account_ === 'string' ? account_ : account_.address
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getBalance.call(client, { account: address, token } as never),
    }),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getBalance {
  export type Args<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    _account extends Account.Account | undefined = Account.Account | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = {
    /** Account (or address) that owns the tokens. @default client.account */
    account?: Account.Account | Address.Address | undefined
  } & TokenParameters<chain, tokens>
  export type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = Omit<ReadParameters, 'account'> & Args<chain, account, tokens>
  export type ReturnType = Amount

  /**
   * Defines a call to the `balanceOf` function.
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
    args: getBalance.Args<chain, account, tokens>,
  ) {
    const account_ = args.account ?? client.account
    if (!account_) throw new Account.NotFoundError()
    const address = typeof account_ === 'string' ? account_ : account_.address
    return defineCall({
      abi: erc20Abi,
      address: resolveToken(client, args).address,
      args: [address],
      functionName: 'balanceOf',
    })
  }
}
