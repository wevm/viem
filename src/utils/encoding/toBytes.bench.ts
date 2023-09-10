import { toBeArray } from 'ethers'
import { bench, describe } from 'vitest'

import { hexToBytes } from './toBytes.js'

describe.skip('Hex to Bytes', () => {
  bench('viem: `hexToBytes`', () => {
    hexToBytes('0x48656c6c6f20576f726c6421')
  })

  bench('ethers: `toBeArray`', () => {
    toBeArray('0x48656c6c6f20576f726c6421')
  })
})
