import { hexZeroPad, zeroPad } from 'ethers/lib/utils'
import { hexZeroPad as hexZeroPad2, zeroPad as zeroPad2 } from 'essential-eth'

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

  bench('essential-eth: `hexZeroPad`', () => {
    hexZeroPad2('0xa4e12a45', 32)
  })
})

describe('Pad Bytes', () => {
  bench('viem: `padBytes`', () => {
    padBytes(new Uint8Array([1, 122, 51, 123]))
  })

  bench('ethers: `zeroPad`', () => {
    zeroPad(new Uint8Array([1, 122, 51, 123]), 32)
  })

  bench('essential-eth: `zeroPad`', () => {
    zeroPad2(new Uint8Array([1, 122, 51, 123]), 32)
  })
})
