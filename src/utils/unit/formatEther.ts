import { etherUnits } from '../../constants/unit.js'

import { formatUnits } from './formatUnits.js'

export function formatEther(wei: bigint, unit: 'wei' | 'gwei' = 'wei') {
  return formatUnits(wei, etherUnits[unit])
}
