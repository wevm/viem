import { etherUnits } from './constants'
import { displayToValue } from './displayToValue'

export function etherToValue(ether: `${number}`, unit: 'wei' | 'gwei' = 'wei') {
  return displayToValue(ether, etherUnits[unit])
}
