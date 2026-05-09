import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { PublicZksyncRpcSchema } from '../types/eip1193.js'
import type { ZksyncFee } from '../types/fee.js'

export type EstimateFeeParameters<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = SendTransactionParameters<chain, account, chainOverride>

export type EstimateFeeReturnType = ZksyncFee
/* @deprecated Use `eth_gasPrice` for `maxFeePerGas`, `eth_estimateGas` to get the `gasLimit`, set `maxPriorityFeePerGas` to `0`, and use `zks_gasPerPubdata` for `gasPerPubdataLimit` instead. */
export async function estimateFee<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZksyncRpcSchema>,
  parameters: EstimateFeeParameters<chain, account>,
): Promise<EstimateFeeReturnType> {
  const { account: account_, ...request } = parameters
  const account = account_ ? parseAccount(account_) : client.account

  const formatters = client.chain?.formatters
  const formatted = formatters?.transactionRequest?.format(
    {
      ...request,
      from: account?.address,
    },
    'estimateFee',
  )

  const result = await client.request({
    method: 'zks_estimateFee',
    params: [formatted],
  })

  return {
    gasLimit: hexToBigInt(result.gas_limit),
    gasPerPubdataLimit: hexToBigInt(result.gas_per_pubdata_limit),
    maxPriorityFeePerGas: hexToBigInt(result.max_priority_fee_per_gas),
    maxFeePerGas: hexToBigInt(result.max_fee_per_gas),
  }
}
