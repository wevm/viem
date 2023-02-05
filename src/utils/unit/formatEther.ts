import { etherUnits } from '../../utils'
import { formatUnit } from './formatUnit'

export function formatEther(wei: bigint, unit: 'wei' | 'gwei' = 'wei') {
  return formatUnit(wei, etherUnits[unit])
}
