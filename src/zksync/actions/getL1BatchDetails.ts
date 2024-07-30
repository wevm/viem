import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type {
  ZkSyncBatchDetails,
  ZkSyncNumberParameter,
} from '../types/block.js'
import type { PublicZkSyncRpcSchema } from '../types/eip1193.js'

export type GetL1BatchDetailsParameters = ZkSyncNumberParameter

export type GetL1BatchDetailsReturnType = ZkSyncBatchDetails

export async function getL1BatchDetails<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetL1BatchDetailsParameters,
): Promise<GetL1BatchDetailsReturnType> {
  const result = await client.request({
    method: 'zks_getL1BatchDetails',
    params: [parameters.number],
  })
  return result
}
