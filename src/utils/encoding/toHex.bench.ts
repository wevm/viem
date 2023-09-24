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

describe('Bytes to Hex', () => {
  const bytes = generateBytes(1024)

  bench('viem: `bytesToHex` (buffer)', () => {
    bytesToHex(new Uint8Array(bytes))
  })

  bench('ethers: `bytesToHex`', () => {
    hexlify(new Uint8Array(bytes))
  })
})
