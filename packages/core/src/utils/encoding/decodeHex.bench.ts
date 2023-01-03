import { bench, describe } from 'vitest'
import Web3 from 'web3'

import { hexToNumber, hexToString } from './decodeHex'

describe('Hex to Number', () => {
  bench('viem: `hexToNumber`', () => {
    hexToNumber('0x1a4')
  })

  bench('web3.js: `hexToNumber`', () => {
    Web3.utils.hexToNumber('0x1a4')
  })
})

describe('Hex to String', () => {
  bench('viem: `hexToString`', () => {
    hexToString('0x48656c6c6f20576f726c6421')
  })

  bench('web3.js: `hexToString`', () => {
    Web3.utils.hexToString('0x48656c6c6f20576f726c6421')
  })
})
