import { gweiUnits } from '../../constants/unit.js'

import { type FormatUnitsErrorType, formatUnits } from './formatUnits.js'

export type FormatGweiErrorType = FormatUnitsErrorType

export function formatGwei(wei: bigint, unit: 'wei' = 'wei') {
  return formatUnits(wei, gweiUnits[unit])
}
