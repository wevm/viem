import type { ErrorType } from '../../errors/utils.js'
import type { ParseUnitsErrorType } from './parseUnits.js'
import * as Value from './Value.js'

export type ParseEtherErrorType = ParseUnitsErrorType | ErrorType

/**
 * Converts a string representation of ether to numerical wei.
 *
 * - Docs: https://viem.sh/docs/utilities/parseEther
 *
 * @example
 * import { parseEther } from 'viem'
 *
 * parseEther('420')
 * // 420000000000000000000n
 */
export function parseEther(ether: string, unit: 'wei' | 'gwei' = 'wei') {
  return Value.fromEther(ether, unit)
}
