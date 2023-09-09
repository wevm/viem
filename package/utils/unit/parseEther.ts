import { etherUnits } from '../../constants/unit.js'

import { parseUnits } from './parseUnits.js'

export function parseEther(ether: string, unit: 'wei' | 'gwei' = 'wei') {
  return parseUnits(ether, etherUnits[unit])
}
