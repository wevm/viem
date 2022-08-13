import { gweiUnits } from './constants'
import { toUnit } from './toUnit'

export function gweiValue(ether: `${number}`, unit: 'wei' = 'wei') {
  return toUnit(ether, gweiUnits[unit])
}
