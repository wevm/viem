import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Hex } from '../../types/misc.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { ZkSyncTransactionRequestParameters } from '../types/transaction.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type EstimateFeeParameters<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = ZkSyncTransactionRequestParameters<TChain, TAccount>

export type Fee = {
  gas_limit: Hex
  gas_per_pubdata_limit: Hex
  max_priority_fee_per_gas: Hex
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
  const formatted = formatters?.transactionRequest?.format({
    ...request,
    from: account?.address,
  })

  const result = await client.request({
    method: 'zks_estimateFee',
    params: [formatted],
  })

  return result
}
