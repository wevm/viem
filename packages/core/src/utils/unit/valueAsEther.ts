import { etherUnits } from '../../constants'
import { valueToDisplay } from './valueToDisplay'

export function valueAsEther(wei: bigint, unit: 'wei' | 'gwei' = 'wei') {
  return valueToDisplay(wei, etherUnits[unit])
}
