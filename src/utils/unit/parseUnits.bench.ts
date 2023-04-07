import { bench, describe } from 'vitest'
import { utils } from 'ethers'
import { parseUnits as parseUnitsV6 } from 'ethers@6'

import { parseUnits } from './parseUnits.js'

describe('Parse Unit', () => {
  bench('viem: `parseUnits`', () => {
    parseUnits('40', 18)
  })

  bench('ethers@5: `parseUnits`', () => {
    utils.parseUnits('40', 18)
  })

  bench('ethers@6: `parseUnits`', () => {
    parseUnitsV6('40', 18)
  })
})
