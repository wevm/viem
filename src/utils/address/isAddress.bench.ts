import { bench, describe } from 'vitest'
import { utils } from 'ethers'
import { isAddress as isAddressV6 } from 'ethers@6'

import { isAddress } from './isAddress.js'

describe('Is Address', () => {
  bench('viem: isAddress', () => {
    isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('ethers@5: isAddress', () => {
    utils.isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('ethers@6: isAddress', () => {
    isAddressV6('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })
})
