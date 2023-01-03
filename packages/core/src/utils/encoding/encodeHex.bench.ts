import { bench, describe } from 'vitest'
import Web3 from 'web3'

import { numberToHex } from './encodeHex'

describe('Number to Hex', () => {
  bench('viem: `numberToHex`', () => {
    numberToHex(52)
  })

  bench('web3.js: `numberToHex`', () => {
    Web3.utils.numberToHex(52)
  })
})
