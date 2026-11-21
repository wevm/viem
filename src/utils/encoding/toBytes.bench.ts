import { toBeArray } from 'ethers'
import { bench, describe } from 'vitest'

import { hexToBytes, toBytes } from './toBytes.js'
import { bytesToHex } from './toHex.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = i
  return bytes
}

const randomHex = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256)
  // Flatten the string, like hex parsed from a JSON-RPC response.
  return JSON.parse(JSON.stringify(bytesToHex(bytes))) as `0x${string}`
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

// Rotates through distinct random inputs so the CPU cannot learn one input.
for (const size of [20, 32, 1024, 100 * 1024]) {
  const pool = Array.from(
    { length: Math.max(16, Math.min(4096, Math.floor(2 ** 23 / size))) },
    () => randomHex(size),
  )
  let i = 0
  describe(`Hex to Bytes (${size} bytes, random pool)`, () => {
    bench('viem: `hexToBytes`', () => {
      hexToBytes(pool[i++ % pool.length]!)
    })
  })
}

describe('Hex to Bytes (20 bytes, size: 32)', () => {
  const hex = randomHex(20)

  bench('viem: `hexToBytes`', () => {
    hexToBytes(hex, { size: 32 })
  })
})

describe('To Bytes (hex)', () => {
  const hex = randomHex(32)

  bench('viem: `toBytes`', () => {
    toBytes(hex)
  })
})
