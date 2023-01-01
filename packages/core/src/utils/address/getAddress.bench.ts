import { bench, describe } from 'vitest'
import { utils } from 'ethers'

import Web3 from 'web3'

import { getAddress } from './getAddress'

describe('Get Address', () => {
  bench('viem: getAddress', () => {
    getAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('ethers: getAddress', () => {
    utils.getAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('web3.js: checkAddressChecksum', () => {
    Web3.utils.checkAddressChecksum(
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    )
  })
})
