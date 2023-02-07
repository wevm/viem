import { hexZeroPad, zeroPad } from 'ethers/lib/utils'

import { bench, describe } from 'vitest'
import Web3 from 'web3'

import { padBytes, padHex } from './pad'

describe('Pad Hex', () => {
  bench('viem: `padHex`', () => {
    padHex('0xa4e12a45')
  })

  bench('ethers: `hexZeroPad`', () => {
    hexZeroPad('0xa4e12a45', 32)
  })

  bench('web3.js: `padLeft`', () => {
    Web3.utils.padLeft('0xa4e12a45', 32)
  })
})

describe('Pad Bytes', () => {
  bench('viem: `padBytes`', () => {
    padBytes(new Uint8Array([1, 122, 51, 123]))
  })

  bench('ethers: `zeroPad`', () => {
    zeroPad(new Uint8Array([1, 122, 51, 123]), 32)
  })
})
