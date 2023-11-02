import { gweiUnits } from '../../constants/unit.js'
import type { ErrorType } from '../../errors/utils.js'

import { type ParseUnitsErrorType, parseUnits } from './parseUnits.js'

export type ParseGweiErrorType = ParseUnitsErrorType | ErrorType

export function parseGwei(ether: string, unit: 'wei' = 'wei') {
  return parseUnits(ether, gweiUnits[unit])
}
