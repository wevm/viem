import { etherUnits } from '../../constants'
import { parseUnits } from './parseUnits'

export function parseEther(ether: `${number}`, unit: 'wei' | 'gwei' = 'wei') {
  return parseUnits(ether, etherUnits[unit])
}
