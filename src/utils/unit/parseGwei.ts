import { gweiUnits } from '../../constants/unit.js'
import type { ErrorType } from '../../errors/utils.js'

import { type ParseUnitsErrorType, parseUnits } from './parseUnits.js'

export type ParseGweiErrorType = ParseUnitsErrorType | ErrorType

/**
 * Takes a string in gwei and returns a bigint in wei
 *
 * Example: parseGwei('420') -> 420000000000n
 */
export function parseGwei(ether: string, unit: 'wei' = 'wei') {
  return parseUnits(ether, gweiUnits[unit])
}
