import { etherUnits } from '../../constants/unit.js'
import type { ErrorType } from '../../errors/utils.js'

import { type ParseUnitsErrorType, parseUnits } from './parseUnits.js'

export type ParseEtherErrorType = ParseUnitsErrorType | ErrorType

/**
 * Converts a string representation of ether to numerical wei.
 *
 * - Docs: https://viem.sh/docs/utilities/parseEther.html
 *
 * @example
 * import { parseEther } from 'viem'
 *
 * parseEther('420')
 * // 420000000000000000000n
 */
export function parseEther(ether: string, unit: 'wei' | 'gwei' = 'wei') {
  return parseUnits(ether, etherUnits[unit])
}
