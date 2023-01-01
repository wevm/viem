import { bench, describe } from 'vitest'
import Web3 from 'web3'

import { hexToNumber } from './hexToNumber'

describe('Hex to Number', () => {
  bench('viem: `hexToNumber`', () => {
    hexToNumber('0x1a4')
  })

  bench('web3.js: `hexToNumber`', () => {
    Web3.utils.hexToNumber('0x1a4')
  })
})
