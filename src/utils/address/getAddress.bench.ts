import { bench, describe } from 'vitest'
import { utils } from 'ethers'

import { getAddress } from './getAddress.js'

describe.skip('Get Address', () => {
  bench('viem: getAddress', () => {
    getAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('ethers: getAddress', () => {
    utils.getAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })
})
