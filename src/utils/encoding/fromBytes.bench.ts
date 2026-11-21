import { hexlify, toUtf8String } from 'ethers'

import { bench, describe } from 'vitest'

import { bytesToBigInt, bytesToNumber, bytesToString } from './fromBytes.js'
import { bytesToHex } from './toHex.js'

describe('Bytes to Hex', () => {
  bench('viem: `bytesToHex`', () => {
    bytesToHex(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('ethers: `hexlify`', () => {
    hexlify(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })
})

describe('Bytes to String', () => {
  bench('viem: `bytesToString`', () => {
    bytesToString(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('ethers: `toUtf8String`', () => {
    toUtf8String(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })
})

describe('Bytes to Number (32-byte ABI offset word)', () => {
  const word = new Uint8Array(32)
  word[31] = 0x20

  bench('viem: `bytesToNumber`', () => {
    bytesToNumber(word)
  })

  bench('viem: `bytesToBigInt`', () => {
    bytesToBigInt(word)
  })
})

describe('Bytes to BigInt (32-byte uint256)', () => {
  const word = Uint8Array.from({ length: 32 }, (_, i) => 255 - i)

  bench('viem: `bytesToBigInt`', () => {
    bytesToBigInt(word)
  })
})
