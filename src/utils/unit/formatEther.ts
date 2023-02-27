import { etherUnits } from '../../constants'
import { formatUnit } from './formatUnit'

export function formatEther(wei: bigint, unit: 'wei' | 'gwei' = 'wei') {
  return formatUnit(wei, etherUnits[unit])
}
