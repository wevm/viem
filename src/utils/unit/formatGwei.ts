import { gweiUnits } from '../../constants'
import { formatUnit } from './formatUnit'

export function formatGwei(wei: bigint, unit: 'wei' = 'wei') {
  return formatUnit(wei, gweiUnits[unit])
}
