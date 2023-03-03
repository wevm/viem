import { hexStripZeros, stripZeros } from 'ethers/lib/utils'
import { stripZerosLeft } from 'ethers@6'

import { bench, describe } from 'vitest'

import { trim } from './trim'

describe.skip('Trim Hex', () => {
  bench('viem: `trimHex`', () => {
    trim('0x00000000000000000000000a4e12a45')
  })

  bench('ethers@5: `hexStripZeros`', () => {
    hexStripZeros('0x00000000000000000000000a4e12a45')
  })

  bench('ethers@6: `stripZerosLeft`', () => {
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

  bench('ethers@5: `stripZeros`', () => {
    stripZeros(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 122, 51,
        123,
      ]),
    )
  })

  bench('ethers@6: `stripZerosLeft`', () => {
    stripZerosLeft(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 122, 51,
        123,
      ]),
    )
  })
})
