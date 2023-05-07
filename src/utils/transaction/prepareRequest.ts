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
import type { PublicClient } from '../../clients/createPublicClient.js'
import type { WalletClient } from '../../clients/createWalletClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import { BaseError } from '../../errors/base.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { parseGwei } from '../unit/parseGwei.js'

import { assertRequest } from './assertRequest.js'

export type PrepareRequestParameters<
  TAccount extends Account | undefined = undefined,
> = GetAccountParameter<TAccount> & {
  gas?: SendTransactionParameters['gas']
  gasPrice?: SendTransactionParameters['gasPrice']
  maxFeePerGas?: SendTransactionParameters['maxFeePerGas']
  maxPriorityFeePerGas?: SendTransactionParameters['maxPriorityFeePerGas']
  nonce?: SendTransactionParameters['nonce']
}

export type PrepareRequestReturnType<
  TAccount extends Account | undefined = undefined,
  TParameters extends PrepareRequestParameters<TAccount> = PrepareRequestParameters<TAccount>,
> = TParameters & {
  from: Address
  gas: SendTransactionParameters['gas']
  gasPrice?: SendTransactionParameters['gasPrice']
  maxFeePerGas?: SendTransactionParameters['maxFeePerGas']
  maxPriorityFeePerGas?: SendTransactionParameters['maxPriorityFeePerGas']
  nonce: SendTransactionParameters['nonce']
}

export const defaultTip = parseGwei('1.5')

export async function prepareRequest<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TParameters extends PrepareRequestParameters<TAccount>,
>(
  client:
    | WalletClient<Transport, TChain, TAccount>
    | PublicClient<Transport, TChain>,
  args: TParameters,
): Promise<PrepareRequestReturnType<TAccount, TParameters>> {
  const {
    account: account_,
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

  if (block.baseFeePerGas) {
    if (typeof gasPrice !== 'undefined')
      throw new BaseError('Chain does not support legacy `gasPrice`.')

    // EIP-1559 fees
    if (typeof maxFeePerGas === 'undefined') {
      // Set a buffer of 1.2x on top of the base fee to account for fluctuations.
      request.maxPriorityFeePerGas = maxPriorityFeePerGas ?? defaultTip
      request.maxFeePerGas =
        (block.baseFeePerGas * 120n) / 100n + request.maxPriorityFeePerGas
    } else {
      if (
        typeof maxPriorityFeePerGas === 'undefined' &&
        maxFeePerGas < defaultTip
      )
        throw new BaseError(
          '`maxFeePerGas` cannot be less than the default `maxPriorityFeePerGas` (1.5 gwei).',
        )
      request.maxFeePerGas = maxFeePerGas
      request.maxPriorityFeePerGas = maxPriorityFeePerGas ?? defaultTip
    }
  } else {
    if (
      typeof maxFeePerGas !== 'undefined' ||
      typeof maxPriorityFeePerGas !== 'undefined'
    )
      throw new BaseError('Chain does not support EIP-1559 fees.')

    // Legacy fees
    if (typeof gasPrice === 'undefined')
      // Set a buffer of 1.2x on top of the base fee to account for fluctuations.
      request.gasPrice = ((await getGasPrice(client)) * 120n) / 100n
  }

  if (typeof gas === 'undefined')
    request.gas = await estimateGas(client, {
      ...request,
      account: { address: account.address, type: 'json-rpc' },
    } as EstimateGasParameters)

  assertRequest(request)

  return request as PrepareRequestReturnType<TAccount, TParameters>
}
