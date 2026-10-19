import type { FormatUnitsErrorType } from './formatUnits.js'
import * as Value from './Value.js'

export type FormatGweiErrorType = FormatUnitsErrorType

/**
 * Converts numerical wei to a string representation of gwei.
 *
 * - Docs: https://viem.sh/docs/utilities/formatGwei
 *
 * @example
 * import { formatGwei } from 'viem'
 *
 * formatGwei(1000000000n)
 * // '1'
 */
export function formatGwei(wei: bigint, unit: 'wei' = 'wei') {
  return Value.formatGwei(wei, unit)
}
