import { etherUnits } from './constants'
import { toUnit } from './toUnit'

export function etherValue(ether: string, unit: 'wei' | 'gwei' = 'wei') {
  return toUnit(ether, etherUnits[unit])
}
