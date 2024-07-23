import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type {
  ZkSyncBlockDetails,
  ZkSyncNumberParameter,
} from '../types/block.js'
import type { PublicZkSyncRpcSchema } from '../types/eip1193.js'

export type GetBlockDetailsParameters = ZkSyncNumberParameter

export type GetBlockDetailsReturnType = ZkSyncBlockDetails

export async function getBlockDetails<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetBlockDetailsParameters,
): Promise<GetBlockDetailsReturnType> {
  const result = await client.request({
    method: 'zks_getBlockDetails',
    params: [parameters.number],
  })
  return result
}
