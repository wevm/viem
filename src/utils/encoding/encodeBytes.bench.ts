import { arrayify, toUtf8Bytes } from 'ethers/lib/utils'
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
})

describe('String to Bytes', () => {
  bench('viem: `stringToBytes`', () => {
    stringToBytes('Hello world')
  })

  bench('ethers: `toUtf8Bytes`', () => {
    toUtf8Bytes('Hello world')
  })
})
