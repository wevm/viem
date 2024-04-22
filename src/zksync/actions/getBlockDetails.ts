import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { ZkSyncNumberParameter } from '../types/block.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type GetBlockDetailsParameters = ZkSyncNumberParameter

export type BaseBlockDetails = {
  number: number
  timestamp: number
  l1BatchNumber: number
  l1TxCount: number
  l2TxCount: number
  rootHash?: Hash
  status: string
  commitTxHash?: Hash
  committedAt?: Date
  proveTxHash?: Hash
  provenAt?: Date
  executeTxHash?: Hash
  executedAt?: Date
  baseSystemContractsHashes: {
    bootloader: Hash
    default_aa: Hash
  }
  operatorAddress: Address
  protocolVersion?: string
}

export async function getBlockDetails<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: GetBlockDetailsParameters,
): Promise<BaseBlockDetails> {
  const result = await client.request({
    method: 'zks_getBlockDetails',
    params: [parameters.number],
  })
  return result
}
