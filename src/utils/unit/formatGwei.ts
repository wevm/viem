import { gweiUnits } from '../../constants/unit.js'

import { type FormatUnitsErrorType, formatUnits } from './formatUnits.js'

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
  return formatUnits(wei, gweiUnits[unit])
}
