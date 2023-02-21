import { bench, describe } from 'vitest'

import { isAddressEqual, isAddressEqualOld } from './isAddressEqual'

describe('Is Address Equal', () => {
  bench('viem: isAddressEqual', () => {
    isAddressEqual(
      '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    )
  })
  bench('viem: isAddressEqual old', () => {
    isAddressEqualOld(
      '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    )
  })
})
