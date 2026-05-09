import { isAddress as isAddressV6 } from 'ethers'
import { bench, describe } from 'vitest'

import { isAddress, isAddressCache } from './isAddress.js'

describe('Is Address', () => {
  bench('viem: isAddress', () => {
    isAddressCache.clear()
    isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', { strict: false })
  })

  bench('viem: isAddress (strict)', () => {
    isAddressCache.clear()
    isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })

  bench('ethers: isAddress', () => {
    isAddressV6('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
  })
})
