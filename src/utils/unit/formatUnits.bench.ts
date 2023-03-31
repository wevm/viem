import { bench, describe } from 'vitest'
import { utils } from 'ethers'
import { formatUnits as formatUnitsV6 } from 'ethers@6'

import { formatUnits } from './formatUnits.js'

describe('Format Unit', () => {
  bench('viem: `formatUnits`', () => {
    formatUnits(40000000000000000000n, 18)
  })

  bench('ethers@5: `formatUnits`', () => {
    utils.formatUnits(40000000000000000000n, 18)
  })

  bench('ethers@6: `formatUnits`', () => {
    formatUnitsV6(40000000000000000000n, 18)
  })
})
