import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { parseAccount } from '../../utils/accounts.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type GetAllBalancesParameters<
  TAccount extends Account | undefined = Account | undefined,
> = GetAccountParameter<TAccount>

export type GetAllBalancesReturnType = { [key: string]: bigint }

export type ZksGetAllBalancesReturnType = { [key: string]: string }

export async function getAllBalances<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: GetAllBalancesParameters<TAccount>,
): Promise<GetAllBalancesReturnType> {
  const { account: account_ } = parameters
  const account = account_ ? parseAccount(account_) : client.account
  const balances = await client.request({
    method: 'zks_getAllAccountBalances',
    params: [account!.address],
  })
  const convertedBalances: GetAllBalancesReturnType = {}
  for (const token in balances) {
    convertedBalances[token] = BigInt(balances[token])
  }
  return convertedBalances
}
