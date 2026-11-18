import { dataLength } from 'ethers'
import { bench, describe } from 'vitest'

import { size } from './size.js'

describe('Size (32-byte hex)', () => {
  const hex = `0x${'a4e12a45'.repeat(8)}` as const

  bench('viem: `size`', () => {
    size(hex)
  })

  bench('ethers: `dataLength`', () => {
    dataLength(hex)
  })
})
