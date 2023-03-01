import { gweiUnits } from '../../constants'
import { parseUnits } from './parseUnits'

export function parseGwei(ether: `${number}`, unit: 'wei' = 'wei') {
  return parseUnits(ether, gweiUnits[unit])
}
