import type { Address } from 'abitype'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import type { PublicZkSyncRpcSchema } from '../types/eip1193.js'

export type GetAllBalancesParameters<
  TAccount extends Account | undefined = Account | undefined,
> = GetAccountParameter<TAccount>

export type GetAllBalancesReturnType = { [key: Address]: bigint }

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
  for (const token in balances)
    (convertedBalances as any)[token] = hexToBigInt((balances as any)[token])
  return convertedBalances
}
