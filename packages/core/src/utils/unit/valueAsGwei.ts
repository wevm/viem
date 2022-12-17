import { gweiUnits } from '../../constants'
import { valueToDisplay } from './valueToDisplay'

export function valueAsGwei(wei: bigint, unit: 'wei' = 'wei') {
  return valueToDisplay(wei, gweiUnits[unit])
}
