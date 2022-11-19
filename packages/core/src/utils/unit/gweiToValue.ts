import { gweiUnits } from './constants'
import { displayToValue } from './displayToValue'

export function gweiToValue(ether: `${number}`, unit: 'wei' = 'wei') {
  return displayToValue(ether, gweiUnits[unit])
}
