import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { Account } from '../../types/account.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'


export type GetL1BatchBlockRangeParameters = {
  l1BatchNumber: number
}

export type GetL1BatchBlockRangeReturnParameters = [number, number]

export async function getL1BatchBlockRange<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetL1BatchBlockRangeParameters,
): Promise<GetL1BatchBlockRangeReturnParameters> {
  const result = await client.request({
    method: 'zks_getL1BatchBlockRange',
    params: [parameters.l1BatchNumber],
  })
  return result
}
