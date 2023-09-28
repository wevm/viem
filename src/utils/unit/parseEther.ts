import { etherUnits } from '../../constants/unit.js'
import type { ErrorType } from '../../errors/utils.js'

import { type ParseUnitsErrorType, parseUnits } from './parseUnits.js'

export type ParseEtherErrorType = ParseUnitsErrorType | ErrorType

export function parseEther(ether: string, unit: 'wei' | 'gwei' = 'wei') {
  return parseUnits(ether, etherUnits[unit])
}
