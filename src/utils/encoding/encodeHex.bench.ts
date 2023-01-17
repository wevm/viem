import { hexlify } from 'ethers/lib/utils'
import { hexlify as hexlify2 } from 'essential-eth'
import { bench, describe } from 'vitest'
import Web3 from 'web3'

import { bytesToHex, numberToHex, stringToHex } from './encodeHex'

describe('Number to Hex', () => {
  bench('viem: `numberToHex`', () => {
    numberToHex(52)
  })

  bench('ethers: `hexlify`', () => {
    hexlify(52)
  })

  bench('web3.js: `numberToHex`', () => {
    Web3.utils.numberToHex(52)
  })

  bench('essential-eth: `hexlify`', () => {
    hexlify2(52)
  })
})

describe('String to Hex', () => {
  bench('viem: `stringToHex`', () => {
    stringToHex('Hello world.')
  })

  bench('web3.js: `stringToHex`', () => {
    Web3.utils.stringToHex('Hello world.')
  })
})

describe('Bytes to Hex', () => {
  bench('viem: `bytesToHex`', () => {
    bytesToHex(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('ethers: `hexlify`', () => {
    hexlify(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('web3.js: `bytesToHex`', () => {
    Web3.utils.bytesToHex([
      72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
    ])
  })

  bench('essential-eth: `hexlify`', () => {
    hexlify2(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })
})
