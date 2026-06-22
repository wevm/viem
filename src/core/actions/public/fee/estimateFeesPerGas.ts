import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import type * as Fee from 'ox/Fee'

import type * as Chain from '../../../Chain.js'
import type * as Client from '../../../Client.js'
import { BaseError } from '../../../Errors.js'
import {
  Eip1559FeesNotSupportedError,
  type estimateMaxPriorityFeePerGas,
  internal_estimateMaxPriorityFeePerGas,
} from './estimateMaxPriorityFeePerGas.js'
import { get } from '../block/get.js'
import { getGasPrice } from './getGasPrice.js'

/**
 * Returns an estimate for the fees per gas (in wei) for a transaction to be
 * likely included in the next block. Defaults to `chain.fees.estimateFeesPerGas`
 * if set.
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
 * const fees = await Actions.fee.estimateFeesPerGas(client)
 * // { maxFeePerGas: ..., maxPriorityFeePerGas: ... }
 * ```
 */
export async function estimateFeesPerGas<
  type extends Fee.FeeValuesType = 'eip1559',
>(
  client: Client.Client,
  options: estimateFeesPerGas.Options<type> = {},
): Promise<estimateFeesPerGas.ReturnType<type>> {
  return internal_estimateFeesPerGas(client, options)
}

export async function internal_estimateFeesPerGas<
  type extends Fee.FeeValuesType = 'eip1559',
>(
  client: Client.Client,
  options: estimateFeesPerGas.Options<type> & {
    block?: Block.Block | undefined
  },
): Promise<estimateFeesPerGas.ReturnType<type>> {
  const { block: block_, chain = client.chain, type = 'eip1559' } = options

  const block = block_ ?? (await get(client))

  const baseFeeMultiplier = await (async () => {
    if (typeof chain?.fees?.baseFeeMultiplier === 'function')
      return chain.fees.baseFeeMultiplier({ block, client })
    return chain?.fees?.baseFeeMultiplier ?? 1.2
  })()
  if (baseFeeMultiplier < 1) throw new BaseFeeScalarError()

  const decimals = baseFeeMultiplier.toString().split('.')[1]?.length ?? 0
  const denominator = 10 ** decimals
  const multiply = (base: bigint) =>
    (base * BigInt(Math.ceil(baseFeeMultiplier * denominator))) /
    BigInt(denominator)

  if (typeof chain?.fees?.estimateFeesPerGas === 'function') {
    const fees = await chain.fees.estimateFeesPerGas({
      block,
      client,
      multiply,
      type,
    })
    if (fees !== null)
      return fees as unknown as estimateFeesPerGas.ReturnType<type>
  }

  if (type === 'eip1559') {
    if (typeof block.baseFeePerGas !== 'bigint')
      throw new Eip1559FeesNotSupportedError()

    const maxPriorityFeePerGas = await internal_estimateMaxPriorityFeePerGas(
      client,
      { block, chain },
    )
    const baseFeePerGas = multiply(block.baseFeePerGas)
    const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
    } as estimateFeesPerGas.ReturnType<type>
  }

  const gasPrice = multiply(await getGasPrice(client))
  return { gasPrice } as estimateFeesPerGas.ReturnType<type>
}

export declare namespace estimateFeesPerGas {
  type Options<type extends Fee.FeeValuesType = Fee.FeeValuesType> = {
    /** Chain to use for fee derivation. Defaults to the Client's chain. */
    chain?: Chain.Chain | undefined
    /**
     * The type of fee values to return.
     *
     * - `legacy`: Returns the legacy gas price.
     * - `eip1559`: Returns the max fee per gas and max priority fee per gas.
     *
     * @default 'eip1559'
     */
    type?: type | Fee.FeeValuesType | undefined
  }

  type ReturnType<type extends Fee.FeeValuesType = 'eip1559'> =
    | (type extends 'legacy' ? Fee.FeeValuesLegacy : never)
    | (type extends 'eip1559' ? Fee.FeeValuesEip1559 : never)

  type ErrorType =
    | BaseFeeScalarError
    | Eip1559FeesNotSupportedError
    | estimateMaxPriorityFeePerGas.ErrorType
    | get.ErrorType
    | getGasPrice.ErrorType
    | Errors.GlobalErrorType
}

/** Thrown when `baseFeeMultiplier` is less than 1. */
export class BaseFeeScalarError extends BaseError {
  override readonly name = 'Fee.BaseFeeScalarError'

  constructor() {
    super('`baseFeeMultiplier` must be greater than 1.')
  }
}
