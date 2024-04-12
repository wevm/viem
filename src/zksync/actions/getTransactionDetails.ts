import type { Address } from 'abitype'
import type { Hash } from '~viem/types/misc.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ChainEIP712 } from '../types/chain.js'

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
>(
  client: Client<Transport, chain>,
  parameters: GetTransactionDetailsParameters,
): Promise<TransactionDetails> {
  const result = await client.request({
    method: 'zks_getTransactionDetails',
    params: [parameters.txHash],
  })
  return result
}
