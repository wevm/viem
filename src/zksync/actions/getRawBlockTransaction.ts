import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { ZkSyncNumberParameter } from '../types/block.js'
import type { PublicZkSyncRpcSchema } from '../types/eip1193.js'
import type { ZkSyncRawBlockTransactions } from '../types/transaction.js'
import { camelCaseKeys } from '../utils/camelCaseKeys.js'

export type GetRawBlockTransactionParameters = ZkSyncNumberParameter

export type GetRawBlockTransactionReturnType = ZkSyncRawBlockTransactions

export async function getRawBlockTransactions<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: GetRawBlockTransactionParameters,
): Promise<GetRawBlockTransactionReturnType> {
  const result = await client.request({
    method: 'zks_getRawBlockTransactions',
    params: [parameters.number],
  })
  return camelCaseKeys(result) as GetRawBlockTransactionReturnType
}
