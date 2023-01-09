import { hexStripZeros, stripZeros } from 'ethers/lib/utils'
import {
  hexStripZeros as hexStripZeros2,
  stripZeros as stripZeros2,
} from 'essential-eth'

import { bench, describe } from 'vitest'

import { trim } from './trim'

describe('Trim Hex', () => {
  bench('viem: `trimHex`', () => {
    trim('0x00000000000000000000000a4e12a45')
  })

  bench('ethers: `hexStripZeros`', () => {
    hexStripZeros('0x00000000000000000000000a4e12a45')
  })

  bench('essential-eth: `hexStripZeros`', () => {
    hexStripZeros2('0x00000000000000000000000a4e12a45')
  })
})

describe('Trim Bytes', () => {
  bench('viem: `trimBytes`', () => {
    trim(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 122, 51, 123,
      ]),
    )
  })

  bench('ethers: `stripZeros`', () => {
    stripZeros(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 122, 51,
        123,
      ]),
    )
  })

  bench('essential-eth: `stripZeros`', () => {
    stripZeros2(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 122, 51, 123,
      ]),
    )
  })
})
