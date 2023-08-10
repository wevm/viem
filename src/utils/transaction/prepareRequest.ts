import type { Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import {
  type EstimateGasParameters,
  estimateGas,
} from '../../actions/public/estimateGas.js'
import { getBlock } from '../../actions/public/getBlock.js'
import { getGasPrice } from '../../actions/public/getGasPrice.js'
import { getTransactionCount } from '../../actions/public/getTransactionCount.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import { BaseError } from '../../errors/base.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain, GetChain } from '../../types/chain.js'
import type { UnionOmit } from '../../types/utils.js'
import type { FormattedTransactionRequest } from '../index.js'
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
  const {
    account: account_,
    chain = client.chain,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
  } = args
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
    let defaultPriorityFee = 1_500_000_000n // 1.5 gwei
    if (typeof chain?.fees?.defaultPriorityFee !== 'undefined') {
      defaultPriorityFee =
        typeof chain.fees.defaultPriorityFee === 'bigint'
          ? chain.fees.defaultPriorityFee
          : await chain.fees.defaultPriorityFee({
              block,
              request: request as PrepareRequestParameters,
            })
    }

    // EIP-1559 fees
    if (typeof maxFeePerGas === 'undefined') {
      // Set a buffer of 1.2x on top of the base fee to account for fluctuations.
      request.maxPriorityFeePerGas = maxPriorityFeePerGas ?? defaultPriorityFee
      request.maxFeePerGas =
        (block.baseFeePerGas * 120n) / 100n + request.maxPriorityFeePerGas
    } else {
      if (
        typeof maxPriorityFeePerGas === 'undefined' &&
        maxFeePerGas < defaultPriorityFee
      )
        throw new BaseError(
          '`maxFeePerGas` cannot be less than the default `maxPriorityFeePerGas` (1.5 gwei).',
        )
      request.maxFeePerGas = maxFeePerGas
      request.maxPriorityFeePerGas = maxPriorityFeePerGas ?? defaultPriorityFee
    }
  } else if (typeof gasPrice === 'undefined') {
    // Legacy fees
    if (
      typeof maxFeePerGas !== 'undefined' ||
      typeof maxPriorityFeePerGas !== 'undefined'
    )
      throw new BaseError('Chain does not support EIP-1559 fees.')

    // Set a buffer of 1.2x on top of the base fee to account for fluctuations.
    request.gasPrice = ((await getGasPrice(client)) * 120n) / 100n
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
