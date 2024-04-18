import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { TransactionRequest as ViemTransactionRequest } from '../../types/transaction.js'
import type { ZkSyncEip712Meta } from '../types/eip712.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type EstimateFeeParameters = {
  transactionRequest: TransactionRequest
}

export type TransactionRequest = ViemTransactionRequest & {
  /** The custom data for EIP712 transaction metadata. */
  customData?: null | ZkSyncEip712Meta
}

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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: EstimateFeeParameters,
): Promise<Fee> {
  const result = await client.request({
    method: 'zks_estimateFee',
    params: [parameters.transactionRequest],
  })
  return result
}
