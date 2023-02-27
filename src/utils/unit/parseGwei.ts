import { gweiUnits } from '../../constants'
import { parseUnit } from './parseUnit'

export function parseGwei(ether: `${number}`, unit: 'wei' = 'wei') {
  return parseUnit(ether, gweiUnits[unit])
}
