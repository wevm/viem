import { etherUnits } from '../../utils'
import { parseUnit } from './parseUnit'

export function parseEther(ether: `${number}`, unit: 'wei' | 'gwei' = 'wei') {
  return parseUnit(ether, etherUnits[unit])
}
