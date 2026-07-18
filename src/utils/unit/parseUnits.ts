import * as Value from 'ox/Value'

import type { ErrorType } from '../../errors/utils.js'

export type ParseUnitsErrorType = ErrorType

/**
 * Multiplies a string representation of a number by a given exponent of base 10 (10exponent).
 *
 * - Docs: https://viem.sh/docs/utilities/parseUnits
 *
 * @example
 * import { parseUnits } from 'viem'
 *
 * parseUnits('420', 9)
 * // 420000000000n
 */
export function parseUnits(value: string, decimals: number) {
  return Value.from(value, decimals)
}
