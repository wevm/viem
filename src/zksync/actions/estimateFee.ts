import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Hex } from '../../types/misc.js'
import type { ChainEIP712 } from '../types/chain.js'
import { type ZkSyncTransactionRequestParameters } from '../types/transaction.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type EstimateFeeParameters<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = ZkSyncTransactionRequestParameters<TChain, TAccount>

/** Represents the transaction fee parameters. */
export type Fee = {
  /** The maximum amount of gas allowed for the transaction. */
  gas_limit: Hex
  /** The maximum amount of gas the user is willing to pay for a single byte of pubdata. */
  gas_per_pubdata_limit: Hex
  /** The EIP1559 tip per gas. */
  max_priority_fee_per_gas: Hex
  /** The EIP1559 fee cap per gas. */
  max_fee_per_gas: Hex
}

export async function estimateFee<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<
    Transport,
    TChain,
    TAccount,
    PublicZkSyncRpcSchema<TChain, TAccount>
  >,
  parameters: EstimateFeeParameters<TChain, TAccount>,
): Promise<Fee> {
  const { account: account_, ...request } = parameters
  const account = account_ ? parseAccount(account_) : client.account

  const formatters = client.chain?.formatters
  const formatted =
    formatters?.transactionRequest?.format({
      ...request,
      from: account?.address,
    }) ?? parameters

  const result = await client.request({
    method: 'zks_estimateFee',
    params: [formatted],
  })

  return result
}
