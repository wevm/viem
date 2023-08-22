import type { Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { internal_estimateFeesPerGas } from '../../actions/public/estimateFeesPerGas.js'
import {
  type EstimateGasParameters,
  estimateGas,
} from '../../actions/public/estimateGas.js'
import { getBlock } from '../../actions/public/getBlock.js'
import { getTransactionCount } from '../../actions/public/getTransactionCount.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import {
  Eip1559FeesNotSupportedError,
  MaxFeePerGasTooLowError,
} from '../../errors/fee.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { GetChain } from '../../types/chain.js'
import type { UnionOmit } from '../../types/utils.js'
import { type FormattedTransactionRequest } from '../index.js'
import { type AssertRequestParameters, assertRequest } from './assertRequest.js'

export type PrepareRequestParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
> = UnionOmit<
  FormattedTransactionRequest<
    TChainOverride extends Chain ? TChainOverride : TChain
  >,
  'from'
> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride>

export type PrepareRequestReturnType<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
  TArgs extends PrepareRequestParameters<
    TChain,
    TAccount,
    TChainOverride
  > = PrepareRequestParameters<TChain, TAccount, TChainOverride>,
> = TArgs & {
  from: Address
  gas: SendTransactionParameters['gas']
  gasPrice?: SendTransactionParameters['gasPrice']
  maxFeePerGas?: SendTransactionParameters['maxFeePerGas']
  maxPriorityFeePerGas?: SendTransactionParameters['maxPriorityFeePerGas']
  nonce: SendTransactionParameters['nonce']
}

export async function prepareRequest<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined,
  TArgs extends PrepareRequestParameters<TChain, TAccount, TChainOverride>,
>(
  client: Client<Transport, TChain, TAccount>,
  args: TArgs,
): Promise<PrepareRequestReturnType<TChain, TAccount, TChainOverride, TArgs>> {
  const { account: account_, chain, gas, gasPrice, nonce } = args
  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  const block = await getBlock(client, { blockTag: 'latest' })

  const request = { ...args, from: account.address }

  if (typeof nonce === 'undefined')
    request.nonce = await getTransactionCount(client, {
      address: account.address,
      blockTag: 'pending',
    })

  if (
    typeof block.baseFeePerGas === 'bigint' &&
    typeof gasPrice === 'undefined'
  ) {
    // EIP-1559 fees
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await internal_estimateFeesPerGas(client, {
        block,
        chain,
        request: request as PrepareRequestParameters,
      })

    if (
      typeof args.maxPriorityFeePerGas === 'undefined' &&
      args.maxFeePerGas &&
      args.maxFeePerGas < maxPriorityFeePerGas
    )
      throw new MaxFeePerGasTooLowError({
        maxPriorityFeePerGas,
      })

    request.maxPriorityFeePerGas = maxPriorityFeePerGas
    request.maxFeePerGas = args.maxFeePerGas ?? maxFeePerGas
  } else if (typeof gasPrice === 'undefined') {
    // Legacy fees
    if (
      typeof args.maxFeePerGas !== 'undefined' ||
      typeof args.maxPriorityFeePerGas !== 'undefined'
    )
      throw new Eip1559FeesNotSupportedError()

    const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
      block,
      chain,
      request: request as PrepareRequestParameters,
      type: 'legacy',
    })
    request.gasPrice = gasPrice_
  }

  if (typeof gas === 'undefined')
    request.gas = await estimateGas(client, {
      ...request,
      account: { address: account.address, type: 'json-rpc' },
    } as EstimateGasParameters)

  assertRequest(request as AssertRequestParameters)

  return request as PrepareRequestReturnType<
    TChain,
    TAccount,
    TChainOverride,
    TArgs
  >
}
