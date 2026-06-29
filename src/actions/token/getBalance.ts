import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { ClientTokens } from '../../tokens/defineToken.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { readContract } from '../public/readContract.js'
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
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const balance = await token.getBalance(client, {
 *   account: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token balance, in base units and human-readable form.
 */
export async function getBalance<
  chain extends Chain | undefined,
  account extends Account | undefined,
  tokens extends ClientTokens | undefined = undefined,
>(
  client: Client<Transport, chain, account, undefined, undefined, tokens>,
  parameters: getBalance.Parameters<chain, account, tokens>,
): Promise<getBalance.ReturnValue> {
  const {
    account: account_ = client.account,
    decimals,
    token,
    ...rest
  } = parameters
  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_).address
  const [amount, { decimals: resolved }] = await Promise.all([
    readContract(client, {
      ...rest,
      ...getBalance.call(client, { account, token } as never),
    }),
    resolveTokenWithDecimals(client, {
      decimals,
      token,
    }),
  ])
  return toAmount(amount, resolved)
}

export namespace getBalance {
  export type Args<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    tokens extends ClientTokens | undefined = ClientTokens | undefined,
  > = GetAccountParameter<account, Account | Address> &
    TokenParameters<chain, tokens>
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    tokens extends ClientTokens | undefined = ClientTokens | undefined,
  > = Omit<ReadParameters, 'account'> & Args<chain, account, tokens>
  export type ReturnValue = Amount

  /**
   * Defines a call to the `balanceOf` function.
   *
   * Can be passed as a parameter to `multicall`, `simulateContract`, or any
   * other action that accepts a contract call. The token is selected by `token`
   * symbol (resolved from the client's `tokens` array) or contract address.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call<
    chain extends Chain | undefined,
    account extends Account | undefined,
    tokens extends ClientTokens | undefined = undefined,
  >(
    client: Client<Transport, chain, account, undefined, undefined, tokens>,
    args: Args<chain, account, tokens>,
  ) {
    const account_ = args.account ?? client.account
    if (!account_) throw new AccountNotFoundError()
    const account = parseAccount(account_).address
    return defineCall({
      address: resolveToken(client, args).address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account],
    })
  }
}
