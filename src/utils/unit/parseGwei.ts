import { gweiUnits } from '../../constants/unit.js'

import { parseUnits } from './parseUnits.js'

export function parseGwei(ether: string, unit: 'wei' = 'wei') {
  return parseUnits(ether, gweiUnits[unit])
}
