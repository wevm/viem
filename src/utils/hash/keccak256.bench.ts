import { keccak256 as keccak256Ethers } from 'ethers'
import { bench, describe } from 'vitest'

import { bytesToHex } from '../encoding/toHex.js'
import { keccak256 } from './keccak256.js'

const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256)
  return bytes
}

for (const size of [32, 1024]) {
  const hex = bytesToHex(randomBytes(size))

  describe(`Keccak256 (${size} bytes, hex)`, () => {
    bench('viem: `keccak256`', () => {
      keccak256(hex)
    })

    bench('ethers: `keccak256`', () => {
      keccak256Ethers(hex)
    })
  })
}

describe('Keccak256 (32 bytes)', () => {
  const bytes = randomBytes(32)

  bench('viem: `keccak256`', () => {
    keccak256(bytes)
  })
})
