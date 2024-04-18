import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type GetBlockDetailsParameters = {
  number: number
}

export type BaseBlockDetails = {
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
    default_aa: string
  }
}

export async function getBlockDetails<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetBlockDetailsParameters,
): Promise<BaseBlockDetails> {
  const result = await client.request({
    method: 'zks_getBlockDetails',
    params: [parameters.number],
  })
  return result
}
