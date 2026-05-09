import { toBeArray } from 'ethers'
import { bench, describe } from 'vitest'

import { hexToBytes } from './toBytes.js'
import { bytesToHex } from './toHex.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = i
  return bytes
}

describe('Hex to Bytes', () => {
  const bytes = bytesToHex(generateBytes(1024))

  bench('viem: `hexToBytes`', () => {
    hexToBytes(bytes)
  })

  bench('ethers: `toBeArray`', () => {
    toBeArray(bytes)
  })
})
