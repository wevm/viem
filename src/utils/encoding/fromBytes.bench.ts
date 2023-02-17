import { hexlify, toUtf8String } from 'ethers/lib/utils'

import { bench, describe } from 'vitest'
import Web3 from 'web3'

import { bytesToHex, bytesToString } from './fromBytes'

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
})

describe('Bytes to String', () => {
  bench('viem: `bytesToString`', () => {
    bytesToString(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('ethers: `toUtf8String`', () => {
    toUtf8String(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })
})
