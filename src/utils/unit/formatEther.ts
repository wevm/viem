import { etherUnits } from '../../constants/index.js'
import { formatUnits } from './formatUnits.js'

export function formatEther(wei: bigint, unit: 'wei' | 'gwei' = 'wei') {
  return formatUnits(wei, etherUnits[unit])
}
