import { parseUnits as parseUnitsV6 } from 'ethers'
import { bench, describe } from 'vitest'

import { parseUnits } from './parseUnits.js'

describe('Parse Unit', () => {
  bench('viem: `parseUnits`', () => {
    parseUnits('40', 18)
  })

  bench('ethers: `parseUnits`', () => {
    parseUnitsV6('40', 18)
  })
})
