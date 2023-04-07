import { utils as ethersV5Utils } from 'ethers'
import { solidityPacked } from 'ethers@6'
import { bench, describe } from 'vitest'
import { address } from '../../_test/index.js'

import { encodePacked } from './encodePacked.js'

describe('Encode Packed ABI', () => {
  bench('viem: `encodePacked`', () => {
    encodePacked(
      ['address', 'string', 'bytes4[]'],
      [address.vitalik, 'hello world', ['0xdeadbeef', '0xcafebabe']],
    )
  })

  bench('ethers@5: `solidityPack`', () => {
    ethersV5Utils.solidityPack(
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
