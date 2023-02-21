import { bench, describe } from 'vitest'
import { utils } from 'ethers'

import Web3 from 'web3'

import { isAddress } from './isAddress'

describe('Is Address', () => {
  bench('viem: isAddress', () => {
    isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('ethers: isAddress', () => {
    utils.isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('web3.js: isAddress', () => {
    Web3.utils.isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })
})
