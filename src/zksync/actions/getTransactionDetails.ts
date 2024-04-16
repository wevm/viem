import type { Address } from 'abitype'
import type { Hash } from '../../types/misc.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { Account } from '../../types/account.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'

export type GetTransactionDetailsParameters = {
  txHash: Hash
}

export interface TransactionDetails {
  isL1Originated: boolean
  status: string
  fee: BigInt
  gasPerPubdata: BigInt
  initiatorAddress: Address
  receivedAt: Date
  ethCommitTxHash?: string
  ethProveTxHash?: string
  ethExecuteTxHash?: string
}

export async function getTransactionDetails<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetTransactionDetailsParameters,
): Promise<TransactionDetails> {
  const result = await client.request({
    method: 'zks_getTransactionDetails',
    params: [parameters.txHash],
  })
  return result
}
