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

describe('Checksum Address (uncached)', () => {
  // More distinct addresses than the checksum cache holds, so every call misses.
  const addresses = Array.from(
    { length: 20_000 },
    (_, i) => `0x${i.toString(16).padStart(8, '0')}${'a4e12a45'.repeat(4)}`,
  )
  let i = 0

  bench('viem: `getAddress`', () => {
    getAddress(addresses[i++ % addresses.length]!)
  })
})
