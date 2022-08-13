import { etherUnits } from './constants'
import { toValue } from './toValue'

export function etherValue(ether: `${number}`, unit: 'wei' | 'gwei' = 'wei') {
  return toValue(ether, etherUnits[unit])
}
