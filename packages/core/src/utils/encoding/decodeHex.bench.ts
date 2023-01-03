import { arrayify } from 'ethers/lib/utils'
import { arrayify as arrayify2 } from 'essential-eth'
import { bench, describe } from 'vitest'
import Web3 from 'web3'

import { hexToBytes, hexToNumber, hexToString } from './decodeHex'

describe('Hex to Number', () => {
  bench('viem: `hexToNumber`', () => {
    hexToNumber('0x1a4')
  })

  bench('web3.js: `hexToNumber`', () => {
    Web3.utils.hexToNumber('0x1a4')
  })
})

describe('Hex to Bytes', () => {
  bench('viem: `hexToBytes`', () => {
    hexToBytes('0x48656c6c6f20576f726c6421')
  })

  bench('ethers: `arrayify`', () => {
    arrayify('0x48656c6c6f20576f726c6421')
  })

  bench('web3.js: `hexToBytes`', () => {
    Web3.utils.hexToBytes('0x48656c6c6f20576f726c6421')
  })

  bench('essential-eth: `arrayify`', () => {
    arrayify2('0x48656c6c6f20576f726c6421')
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
