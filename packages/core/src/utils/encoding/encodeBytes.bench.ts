import { arrayify, toUtf8Bytes } from 'ethers/lib/utils'
import {
  arrayify as arrayify2,
  toUtf8Bytes as toUtf8Bytes2,
} from 'essential-eth'
import { bench, describe } from 'vitest'
import Web3 from 'web3'

import { hexToBytes, stringToBytes } from './encodeBytes'

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

describe('String to Bytes', () => {
  bench('viem: `stringToBytes`', () => {
    stringToBytes('Hello world')
  })

  bench('ethers: `toUtf8Bytes`', () => {
    toUtf8Bytes('Hello world')
  })

  bench('essential-eth: `toUtf8Bytes`', () => {
    toUtf8Bytes2('Hello world')
  })
})
