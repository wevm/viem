import {
  estimateGas,
  getBlock,
  getGasPrice,
  getTransactionCount,
  SendTransactionParameters,
} from '../../actions'
import type { PublicClient, WalletClient } from '../../clients'
import { BaseError } from '../../errors'
import type { Address } from '../../types'
import { parseGwei } from '../unit/parseGwei'
import { assertRequest } from './assertRequest'

export type PrepareRequestParameters<
  TParameters extends SendTransactionParameters = SendTransactionParameters,
> = TParameters

export type PrepareRequestReturnType<
  TParameters extends SendTransactionParameters = SendTransactionParameters,
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
  TParameters extends SendTransactionParameters,
>(
  client: WalletClient<any, any> | PublicClient<any, any>,
  args: PrepareRequestParameters<TParameters>,
): Promise<PrepareRequestReturnType<TParameters>> {
  const { account, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce } =
    args

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
    })

  assertRequest(request)

  return request as PrepareRequestReturnType<TParameters>
}
