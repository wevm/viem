import { dataSlice } from 'ethers'
import { bench, describe } from 'vitest'

import { sliceHex } from './slice.js'

describe('Slice Hex (1 KB, 4 to 36)', () => {
  const hex = `0x${'a4e12a45'.repeat(256)}` as const

  bench('viem: `sliceHex`', () => {
    sliceHex(hex, 4, 36)
  })

  bench('ethers: `dataSlice`', () => {
    dataSlice(hex, 4, 36)
  })
})
