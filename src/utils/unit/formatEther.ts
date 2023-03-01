import { etherUnits } from '../../constants'
import { formatUnits } from './formatUnits'

export function formatEther(wei: bigint, unit: 'wei' | 'gwei' = 'wei') {
  return formatUnits(wei, etherUnits[unit])
}
