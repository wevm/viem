import { utils as ethersV5Utils } from 'ethers'
import { toBeArray } from 'ethers@6'
import { bench, describe } from 'vitest'

import { hexToBytes, stringToBytes } from './toBytes.js'

describe.skip('Hex to Bytes', () => {
  bench('viem: `hexToBytes`', () => {
    hexToBytes('0x48656c6c6f20576f726c6421')
  })

  bench('ethers@5: `arrayify`', () => {
    ethersV5Utils.arrayify('0x48656c6c6f20576f726c6421')
  })

  bench('ethers@6: `toBeArray`', () => {
    toBeArray('0x48656c6c6f20576f726c6421')
  })
})

describe.skip('String to Bytes', () => {
  bench('viem: `stringToBytes`', () => {
    stringToBytes('Hello world')
  })

  bench('ethers: `toUtf8Bytes`', () => {
    ethersV5Utils.toUtf8Bytes('Hello world')
  })
})
