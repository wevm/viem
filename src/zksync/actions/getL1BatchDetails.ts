import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'
import type { ChainEIP712 } from '../types/chain.js'

export type GetL1BatchDetailsParameters = {
  number: number
}

export interface BatchDetails {
  number: number
  timestamp: number
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
  l1GasPrice: number
  l2FairGasPrice: number
  baseSystemContractsHashes: {
    bootloader: string
    default_aa: string
  }
}

export async function getL1BatchDetails<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetL1BatchDetailsParameters,
): Promise<BatchDetails> {
  const result = await client.request({
    method: 'zks_getL1BatchDetails',
    params: [parameters.number],
  })
  return result
}
