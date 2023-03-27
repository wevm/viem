import { etherUnits } from '../../constants/index.js'
import { parseUnits } from './parseUnits.js'

export function parseEther(ether: `${number}`, unit: 'wei' | 'gwei' = 'wei') {
  return parseUnits(ether, etherUnits[unit])
}
