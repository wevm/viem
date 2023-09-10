import { solidityPacked } from 'ethers'
import { bench, describe } from 'vitest'

import { address } from '~test/src/constants.js'

import { encodePacked } from './encodePacked.js'

describe('Encode Packed ABI', () => {
  bench('viem: `encodePacked`', () => {
    encodePacked(
      ['address', 'string', 'bytes4[]'],
      [address.vitalik, 'hello world', ['0xdeadbeef', '0xcafebabe']],
    )
  })

  bench('ethers: `solidityPacked`', () => {
    solidityPacked(
      ['address', 'string', 'bytes4[]'],
      [address.vitalik, 'hello world', ['0xdeadbeef', '0xcafebabe']],
    )
  })
})
