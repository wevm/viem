import { gweiUnits } from '../../constants/unit.js'

import { formatUnits } from './formatUnits.js'

export function formatGwei(wei: bigint, unit: 'wei' = 'wei') {
  return formatUnits(wei, gweiUnits[unit])
}
