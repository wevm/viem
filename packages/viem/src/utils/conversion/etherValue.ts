import { etherUnits } from './constants'
import { toUnit } from './toUnit'

export function etherValue(ether: `${number}`, unit: 'wei' | 'gwei' = 'wei') {
  return toUnit(ether, etherUnits[unit])
}
