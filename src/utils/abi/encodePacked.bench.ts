import { solidityPack } from 'ethers/lib/utils'
import { solidityPacked } from 'ethers@6'
import { bench, describe } from 'vitest'
import { address } from '../../_test.js'

import { encodePacked } from './encodePacked.js'

describe('Encode Packed ABI', () => {
  bench('viem: `encodePacked`', () => {
    encodePacked(
      ['address', 'string', 'bytes4[]'],
      [address.vitalik, 'hello world', ['0xdeadbeef', '0xcafebabe']],
    )
  })

  bench('ethers@5: `solidityPack`', () => {
    solidityPack(
      ['address', 'string', 'bytes4[]'],
      [address.vitalik, 'hello world', ['0xdeadbeef', '0xcafebabe']],
    )
  })

  bench('ethers@6: `solidityPacked`', () => {
    solidityPacked(
      ['address', 'string', 'bytes4[]'],
      [address.vitalik, 'hello world', ['0xdeadbeef', '0xcafebabe']],
    )
  })
})
