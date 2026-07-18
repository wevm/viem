import * as Value from 'ox/Value'

import type { ErrorType } from '../../errors/utils.js'

export type FormatUnitsErrorType = ErrorType

/**
 *  Divides a number by a given exponent of base 10 (10exponent), and formats it into a string representation of the number..
 *
 * - Docs: https://viem.sh/docs/utilities/formatUnits
 *
 * @example
 * import { formatUnits } from 'viem'
 *
 * formatUnits(420000000000n, 9)
 * // '420'
 */
export function formatUnits(value: bigint, decimals: number) {
  return Value.format(value, decimals)
}
