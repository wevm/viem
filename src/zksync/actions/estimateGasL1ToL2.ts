import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import { parseAccount } from '../../utils/index.js'
import type { ChainEIP712 } from '../types/chain.js'
import { type ZkSyncTransactionRequestParameters } from '../types/transaction.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type EstimateGasL1ToL2Parameters<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = ZkSyncTransactionRequestParameters<TChain, TAccount>

export async function estimateGasL1ToL2<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<
    Transport,
    TChain,
    TAccount,
    PublicZkSyncRpcSchema<TChain, TAccount>
  >,
  parameters: EstimateGasL1ToL2Parameters<TChain, TAccount>,
): Promise<bigint> {
  const { account: account_, ...request } = parameters
  const account = account_ ? parseAccount(account_) : client.account

  const formatters = client.chain?.formatters
  const formatted = formatters?.transactionRequest?.format({
    ...request,
    from: account?.address,
  })

  const result = await client.request({
    method: 'zks_estimateGasL1ToL2',
    params: [formatted],
  })

  return result
}
