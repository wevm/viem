import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash } from '../../../types/misc.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'

export type GetProtocolVersionParameters = {
  id?: number
}

export type GetProtocolVersionReturnType = {
  version_id: number
  timestamp: number
  verification_keys_hashes: {
    params: {
      recursion_node_level_vk_hash: Hash
      recursion_leaf_level_vk_hash: Hash
      recursion_circuits_set_vks_hash: Hash
    }
    recursion_scheduler_level_vk_hash: Hash
  }
  base_system_contracts: {
    bootloader: Hash
    default_aa: Address
  }
  l2_system_upgrade_tx_hash: Hash | null
}

export async function getProtocolVersion<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: GetProtocolVersionParameters,
): Promise<GetProtocolVersionReturnType> {
  const result = await client.request({
    method: 'zks_getProtocolVersion',
    params: [parameters?.id],
  })
  return result
}
