import { etherUnits } from '../../constants/unit.js'

import { type FormatUnitsErrorType, formatUnits } from './formatUnits.js'

export type FormatEtherErrorType = FormatUnitsErrorType

export function formatEther(wei: bigint, unit: 'wei' | 'gwei' = 'wei') {
  return formatUnits(wei, etherUnits[unit])
}
