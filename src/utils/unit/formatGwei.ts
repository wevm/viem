import { gweiUnits } from '../../constants'
import { formatUnits } from './formatUnits'

export function formatGwei(wei: bigint, unit: 'wei' = 'wei') {
  return formatUnits(wei, gweiUnits[unit])
}
