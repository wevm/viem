import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { ZkSyncTransactionRequest } from '../types/transaction.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type TransactionRequest = ZkSyncTransactionRequest

export type EstimateFeeParameters = TransactionRequest

/** Represents the transaction fee parameters. */
export type Fee = {
  /** The maximum amount of gas allowed for the transaction. */
  gasLimit: bigint
  /** The maximum amount of gas the user is willing to pay for a single byte of pubdata. */
  gasPerPubdataLimit: bigint
  /** The EIP1559 tip per gas. */
  maxPriorityFeePerGas: bigint
  /** The EIP1559 fee cap per gas. */
  maxFeePerGas: bigint
}

export async function estimateFee<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: EstimateFeeParameters,
): Promise<Fee> {
  const result = await client.request({
    method: 'zks_estimateFee',
    params: [parameters],
  })
  return result
}
