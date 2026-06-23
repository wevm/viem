import * as Hex from 'ox/Hex'

import * as NodeError from '../../NodeError.js'

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
    throw new NodeError.FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new NodeError.TipAboveFeeCapError({
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

  type ErrorType = NodeError.FeeCapTooHighError | NodeError.TipAboveFeeCapError
}
