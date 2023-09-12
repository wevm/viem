import { zeroPadValue } from 'ethers'

import { bench, describe } from 'vitest'

import { padBytes, padHex } from './pad.js'

describe('Pad Hex', () => {
  bench('viem: `padHex`', () => {
    padHex('0xa4e12a45')
  })

  bench('ethers: `zeroPadValue`', () => {
    zeroPadValue('0xa4e12a45', 32)
  })
})

describe('Pad Bytes', () => {
  bench('viem: `padBytes`', () => {
    padBytes(new Uint8Array([1, 122, 51, 123]))
  })

  bench('ethers: `zeroPadValue`', () => {
    zeroPadValue(new Uint8Array([1, 122, 51, 123]), 32)
  })
})
