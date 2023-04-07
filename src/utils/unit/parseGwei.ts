import { gweiUnits } from '../../constants/index.js'
import { parseUnits } from './parseUnits.js'

export function parseGwei(ether: `${number}`, unit: 'wei' = 'wei') {
  return parseUnits(ether, gweiUnits[unit])
}
