import { utils as ethersV5Utils } from 'ethers'
import { hexlify as hexlifyV6, toUtf8String as toUtf8StringV6 } from 'ethers@6'

import { bench, describe } from 'vitest'

import { bytesToHex, bytesToString } from './fromBytes.js'

describe('Bytes to Hex', () => {
  bench('viem: `bytesToHex`', () => {
    bytesToHex(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('ethers@5: `hexlify`', () => {
    ethersV5Utils.hexlify(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('ethers@6: `hexlify`', () => {
    hexlifyV6(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })
})

describe('Bytes to String', () => {
  bench('viem: `bytesToString`', () => {
    bytesToString(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('ethers@5: `toUtf8String`', () => {
    ethersV5Utils.toUtf8String(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })

  bench('ethers@6: `toUtf8String`', () => {
    toUtf8StringV6(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
  })
})
