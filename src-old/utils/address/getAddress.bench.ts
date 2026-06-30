import { getAddress as getAddressV6 } from 'ethers'
import { bench, describe } from 'vitest'

import { getAddress } from './getAddress.js'

describe.skip('Get Address', () => {
  bench('viem: getAddress', () => {
    getAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('ethers: getAddress', () => {
    getAddressV6('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })
})
