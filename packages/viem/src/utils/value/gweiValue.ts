import { gweiUnits } from './constants'
import { toValue } from './toValue'

export function gweiValue(ether: `${number}`, unit: 'wei' = 'wei') {
  return toValue(ether, gweiUnits[unit])
}
