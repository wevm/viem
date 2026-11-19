import { stripZerosLeft } from 'ethers'

import { bench, describe } from 'vitest'

import { trim } from './trim.js'

describe.skip('Trim Hex', () => {
  bench('viem: `trimHex`', () => {
    trim('0x00000000000000000000000a4e12a45')
  })

  bench('ethers: `stripZerosLeft`', () => {
    stripZerosLeft('0x00000000000000000000000a4e12a45a')
  })
})

describe.skip('Trim Bytes', () => {
  bench('viem: `trimBytes`', () => {
    trim(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 122, 51, 123,
      ]),
    )
  })

  bench('ethers: `stripZerosLeft`', () => {
    stripZerosLeft(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 122, 51,
        123,
      ]),
    )
  })
})

describe('Trim Hex (32 bytes)', () => {
  bench('viem: `trim`', () => {
    trim(`0x${'0'.repeat(56)}a4e12a45`)
  })
})

describe('Trim Bytes (32 bytes)', () => {
  const bytes = new Uint8Array(32)
  bytes[31] = 1

  bench('viem: `trim`', () => {
    trim(bytes)
  })
})
