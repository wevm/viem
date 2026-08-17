import { Hex } from 'ox'

import type * as Chain from '../../Chain.js'
import * as RpcError from '../../RpcError.js'

const maxUint256 = 2n ** 256n - 1n

function toBigInt(value: bigint | number | Hex.Hex | undefined) {
  if (value === undefined) return undefined
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(value)
  return Hex.toBigInt(value)
}

/**
 * Asserts transaction request fee invariants that the `TransactionRequest` zod
 * schema cannot express (range and cross-field checks). Address and wire-format
 * validation is handled by the schema during request encoding.
 *
 * @internal
 */
export function assert(options: assert.Options): void {
  const maxFeePerGas = toBigInt(options.maxFeePerGas)
  const maxPriorityFeePerGas = toBigInt(options.maxPriorityFeePerGas)

  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new RpcError.FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new RpcError.TipAboveFeeCapError({
      maxFeePerGas,
      maxPriorityFeePerGas,
    })
}

export declare namespace assert {
  type Options = {
    /** Maximum fee per gas. */
    maxFeePerGas?: bigint | number | Hex.Hex | undefined
    /** Maximum priority fee per gas. */
    maxPriorityFeePerGas?: bigint | number | Hex.Hex | undefined
  }

  type ErrorType = RpcError.FeeCapTooHighError | RpcError.TipAboveFeeCapError
}

export type Options<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
> = Omit<
  Chain.ExtractTransactionRequest<chain>,
  'gasPrice' | 'maxFeePerGas' | 'maxPriorityFeePerGas' | 'type'
> &
  FeeOptions & {
    /** Value in wei sent with this transaction. */
    value?: Value<chain> | undefined
  }

type FeeOptions =
  | {
      /** Gas price for legacy and EIP-2930 transactions. */
      gasPrice?: FeeValue | undefined
      maxFeePerGas?: undefined
      maxPriorityFeePerGas?: undefined
      /** Transaction type. */
      type?: 'legacy' | 'eip2930' | undefined
    }
  | {
      gasPrice?: undefined
      /** Maximum fee per gas. */
      maxFeePerGas?: FeeValue | undefined
      /** Maximum priority fee per gas. */
      maxPriorityFeePerGas?: FeeValue | undefined
      /** Transaction type. */
      type?: 'eip1559' | 'eip4844' | 'eip7702' | undefined
    }
  | {
      gasPrice?: undefined
      maxFeePerGas?: undefined
      maxPriorityFeePerGas?: undefined
      /** Transaction type. */
      type?: string | undefined
    }

type FeeValue = Hex.Hex | bigint | number

type Value<chain extends Chain.Chain | undefined> =
  Chain.ExtractTransactionRequest<chain> extends { value?: infer value }
    ? value
    : Hex.Hex | bigint | number
