import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type GetAllBalancesParameters = {
  address: Hash
}

export type GetAllBalancesReturnType = { [key: string]: bigint }

export type ZksGetAllBalancesReturnType = { [key: string]: string }

export async function getAllBalances<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetAllBalancesParameters,
): Promise<GetAllBalancesReturnType> {
  const balances = await client.request({
    method: 'zks_getAllAccountBalances',
    params: [parameters.address],
  })
  const convertedBalances: GetAllBalancesReturnType = {}
  for (const token in balances) {
    convertedBalances[token] = BigInt(balances[token])
  }
  return convertedBalances
}
