import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'
import type { ChainEIP712 } from '../types/chain.js'

export type GetBlockDetailsParameters = {
  number: number
}

export type BlockDetails = {
  number: number
  timestamp: number
  l1BatchNumber: number
  l1TxCount: number
  l2TxCount: number
  rootHash?: string
  status: string
  commitTxHash?: string
  committedAt?: Date
  proveTxHash?: string
  provenAt?: Date
  executeTxHash?: string
  executedAt?: Date
  baseSystemContractsHashes: {
    bootloader: string
    defaultAa: string
  }
}

export async function getBlockDetails<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetBlockDetailsParameters,
): Promise<BlockDetails> {
  const result = await client.request({
    method: 'zks_getBlockDetails',
    params: [parameters.number],
  })
  return result
}
