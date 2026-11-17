import type { Block, Errors, Fee, TransactionRequest } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { LruMap } from '../../internal/lru.js'
import {
  Eip1559FeesNotSupportedError,
  type estimateMaxPriorityFeePerGas,
  internal_estimateMaxPriorityFeePerGas,
} from './estimateMaxPriorityFeePerGas.js'
import { get } from '../block/get.js'
import { getGasPrice } from './getGasPrice.js'

/**
 * Whether each client's network has EIP-1559 fees, keyed by client uid.
 *
 * @internal
 */
export const eip1559NetworkCache = /*#__PURE__*/ new LruMap<boolean>(128)

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
    /**
     * The transaction request, supplied to the chain's fee functions. Undefined
     * when estimating fees outside of a transaction request context.
     */
    request?: TransactionRequest.toRpc.Input | undefined
  },
): Promise<estimateFeesPerGas.ReturnType<type>> {
  const {
    block: block_,
    chain = client.chain,
    request,
    type = 'eip1559',
  } = options

  // Chain fee hooks receive the block and the request, so the requests they
  // depend on are made in sequence.
  const hasFeeHooks = Object.values(chain?.fees ?? {}).some(
    (fee) => typeof fee === 'function',
  )

  // Without chain fee hooks, legacy fees never read the block.
  const blockPromise =
    block_ || (type === 'legacy' && !hasFeeHooks) ? undefined : get(client)
  // A rejection is thrown when the block is awaited.
  blockPromise?.catch(() => {})

  // Without chain fee hooks, the priority fee does not depend on the block,
  // so it is estimated concurrently with the block request, unless the
  // network is already known to lack EIP-1559 fees.
  const priorityFeePromise =
    blockPromise &&
    type === 'eip1559' &&
    !hasFeeHooks &&
    typeof request?.maxPriorityFeePerGas !== 'bigint' &&
    eip1559NetworkCache.get(client.uid) !== false
      ? internal_estimateMaxPriorityFeePerGas(client, {
          block: blockPromise,
          chain,
          request,
        })
      : undefined
  // A rejection is thrown when the priority fee is awaited.
  priorityFeePromise?.catch(() => {})

  // The block error takes precedence over the priority fee error.
  const block = block_ ?? (await blockPromise)
  if (blockPromise)
    eip1559NetworkCache.set(
      client.uid,
      typeof block?.baseFeePerGas === 'bigint',
    )

  const baseFeeMultiplier = await (async () => {
    if (typeof chain?.fees?.baseFeeMultiplier === 'function')
      return chain.fees.baseFeeMultiplier({ block: block!, client, request })
    return chain?.fees?.baseFeeMultiplier ?? 1.2
  })()
  if (baseFeeMultiplier < 1) throw new BaseFeeScalarError()

  const decimals = baseFeeMultiplier.toString().split('.')[1]?.length ?? 0
  const denominator = 10 ** decimals
  const multiply = (base: bigint) =>
    (base * BigInt(Math.round(baseFeeMultiplier * denominator))) /
    BigInt(denominator)

  if (typeof chain?.fees?.estimateFeesPerGas === 'function') {
    const fees = await chain.fees.estimateFeesPerGas({
      block: block!,
      client,
      multiply,
      request,
      type,
    })
    if (fees !== null)
      return fees as unknown as estimateFeesPerGas.ReturnType<type>
  }

  if (type === 'eip1559') {
    if (typeof block?.baseFeePerGas !== 'bigint')
      throw new Eip1559FeesNotSupportedError()

    const maxPriorityFeePerGas =
      typeof request?.maxPriorityFeePerGas === 'bigint'
        ? request.maxPriorityFeePerGas
        : await (priorityFeePromise ??
            internal_estimateMaxPriorityFeePerGas(client, {
              block,
              chain,
              request,
            }))
    const baseFeePerGas = multiply(block.baseFeePerGas)
    const maxFeePerGas =
      request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
    } as estimateFeesPerGas.ReturnType<type>
  }

  const gasPrice = request?.gasPrice ?? multiply(await getGasPrice(client))
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
