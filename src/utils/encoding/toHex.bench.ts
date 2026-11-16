import { hexlify, toBeHex, toUtf8Bytes } from 'ethers'
import { bench, describe } from 'vitest'

import { bytesToHex, numberToHex, stringToHex } from './toHex.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = i
  return bytes
}

describe.skip('Number to Hex', () => {
  bench('viem: `numberToHex`', () => {
    numberToHex(52)
  })

  bench('ethers: `hexlify`', () => {
    toBeHex(52)
  })
})

describe('String to Hex', () => {
  bench('viem: `stringToHex`', () => {
    stringToHex('Hello world.')
  })

  bench('ethers: `hexlify`', () => {
    hexlify(toUtf8Bytes('Hello world.'))
  })
})

for (const [label, value] of [
  ['64 chars', 'x'.repeat(64)],
  ['200 chars', 'x'.repeat(200)],
  ['10K chars', 'x'.repeat(10_000)],
  ['12 chars, non-ASCII', 'Héllo wörld.'],
] as const)
  describe(`String to Hex (${label})`, () => {
    bench('viem: `stringToHex`', () => {
      stringToHex(value)
    })
  })

describe('Bytes to Hex', () => {
  const bytes = generateBytes(1024)

  bench('viem: `bytesToHex` (buffer)', () => {
    bytesToHex(new Uint8Array(bytes))
  })

  bench('ethers: `bytesToHex`', () => {
    hexlify(new Uint8Array(bytes))
  })
})

const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256)
  return bytes
}

// Rotates through distinct random inputs so the CPU cannot learn one input.
for (const size of [20, 32, 1024, 100 * 1024]) {
  const pool = Array.from(
    { length: Math.max(16, Math.min(4096, Math.floor(2 ** 23 / size))) },
    () => randomBytes(size),
  )
  let i = 0
  describe(`Bytes to Hex (${size} bytes, random pool)`, () => {
    bench('viem: `bytesToHex`', () => {
      bytesToHex(pool[i++ % pool.length]!)
    })
  })
}
