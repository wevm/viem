import { gweiUnits } from '../../constants/index.js'
import { formatUnits } from './formatUnits.js'

export function formatGwei(wei: bigint, unit: 'wei' = 'wei') {
  return formatUnits(wei, gweiUnits[unit])
}
