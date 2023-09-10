import { utils as ethersV5Utils } from 'ethers'
import { zeroPadValue } from 'ethers@6'

import { bench, describe } from 'vitest'

import { padBytes, padHex } from './pad.js'

describe('Pad Hex', () => {
  bench('viem: `padHex`', () => {
    padHex('0xa4e12a45')
  })

  bench('ethers@5: `hexZeroPad`', () => {
    ethersV5Utils.hexZeroPad('0xa4e12a45', 32)
  })

  bench('ethers@6: `zeroPadValue`', () => {
    zeroPadValue('0xa4e12a45', 32)
  })
})

describe('Pad Bytes', () => {
  bench('viem: `padBytes`', () => {
    padBytes(new Uint8Array([1, 122, 51, 123]))
  })

  bench('ethers@5: `zeroPad`', () => {
    ethersV5Utils.zeroPad(new Uint8Array([1, 122, 51, 123]), 32)
  })

  bench('ethers@6: `zeroPadValue`', () => {
    zeroPadValue(new Uint8Array([1, 122, 51, 123]), 32)
  })
})
