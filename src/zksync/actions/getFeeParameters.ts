import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZkSyncRpcSchema } from '../types/eip1193.js'

export type GetFeeParamsReturnType = {
  V2: {
    config: {
      minimal_l2_gas_price: bigint
      compute_overhead_part: bigint
      pubdata_overhead_part: bigint
      batch_overhead_l1_gas: bigint
      max_gas_per_batch: bigint
      max_pubdata_per_batch: bigint
    }
    l1_gas_price: bigint
    l1_pubdata_price: bigint
  }
}

export async function getFeeParams<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
): Promise<GetFeeParamsReturnType> {
  const result = await client.request({
    method: 'zks_getFeeParams',
    params: [],
  })
  return result
}
