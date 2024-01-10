import { gweiUnits } from '../../constants/unit.js'
import type { ErrorType } from '../../errors/utils.js'

import { type ParseUnitsErrorType, parseUnits } from './parseUnits.js'

export type ParseGweiErrorType = ParseUnitsErrorType | ErrorType

/**
 * Converts a string representation of gwei to numerical wei.
 *
 * - Docs: https://viem.sh/docs/utilities/parseGwei
 *
 * @example
 * import { parseGwei } from 'viem'
 *
 * parseGwei('420')
 * // 420000000000n
 */
export function parseGwei(ether: string, unit: 'wei' = 'wei') {
  return parseUnits(ether, gweiUnits[unit])
}
