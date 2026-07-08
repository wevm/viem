import type { Block, Errors, TransactionRequest } from 'ox'
import { z } from 'ox/zod'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { get } from '../block/get.js'
import { getGasPrice } from './getGasPrice.js'

/**
 * Returns an estimate for the max priority fee per gas (in wei) for a
 * transaction to be likely included in the next block. Defaults to
 * `chain.fees.maxPriorityFeePerGas` if set.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const maxPriorityFeePerGas = await Actions.fee.estimateMaxPriorityFeePerGas(client)
 * ```
 */
export async function estimateMaxPriorityFeePerGas(
  client: Client.Client,
  options: estimateMaxPriorityFeePerGas.Options = {},
): Promise<estimateMaxPriorityFeePerGas.ReturnType> {
  return internal_estimateMaxPriorityFeePerGas(client, options)
}

export async function internal_estimateMaxPriorityFeePerGas(
  client: Client.Client,
  options: estimateMaxPriorityFeePerGas.Options & {
    block?: Block.Block | undefined
    /**
     * The transaction request, supplied to the chain's fee functions. Undefined
     * when estimating fees outside of a transaction request context.
     */
    request?: TransactionRequest.toRpc.Input | undefined
  },
): Promise<estimateMaxPriorityFeePerGas.ReturnType> {
  const { block: block_, chain = client.chain, request } = options

  try {
    const maxPriorityFeePerGas = chain?.fees?.maxPriorityFeePerGas

    if (typeof maxPriorityFeePerGas === 'function') {
      const block = block_ ?? (await get(client))
      const result = await maxPriorityFeePerGas({ block, client, request })
      if (result === null) throw new Error()
      return result
    }

    if (typeof maxPriorityFeePerGas !== 'undefined') return maxPriorityFeePerGas

    const maxPriorityFeePerGasHex = await client.request({
      method: 'eth_maxPriorityFeePerGas',
    })
    return z.RpcSchema.decodeReturns(
      z.RpcSchema.Eth,
      'eth_maxPriorityFeePerGas',
      maxPriorityFeePerGasHex,
    )
  } catch {
    // If the RPC Provider does not support `eth_maxPriorityFeePerGas`
    // fall back to calculating it manually via `gasPrice - baseFeePerGas`.
    // See: https://github.com/ethereum/pm/issues/328#:~:text=eth_maxPriorityFeePerGas%20after%20London%20will%20effectively%20return%20eth_gasPrice%20%2D%20baseFee
    const [block, gasPrice] = await Promise.all([
      block_ ? Promise.resolve(block_) : get(client),
      getGasPrice(client),
    ])

    if (typeof block.baseFeePerGas !== 'bigint')
      throw new Eip1559FeesNotSupportedError()

    const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas

    if (maxPriorityFeePerGas < 0n) return 0n
    return maxPriorityFeePerGas
  }
}

export declare namespace estimateMaxPriorityFeePerGas {
  type Options = {
    /** Chain to use for fee derivation. Defaults to the Client's chain. */
    chain?: Chain.Chain | undefined
  }

  type ReturnType = bigint

  type ErrorType =
    | get.ErrorType
    | getGasPrice.ErrorType
    | Eip1559FeesNotSupportedError
    | Errors.GlobalErrorType
}

/** Thrown when a chain does not support EIP-1559 fees. */
export class Eip1559FeesNotSupportedError extends BaseError {
  override readonly name = 'Fee.Eip1559FeesNotSupportedError'

  constructor() {
    super('Chain does not support EIP-1559 fees.')
  }
}
