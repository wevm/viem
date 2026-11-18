import { concat as concatEthers } from 'ethers'
import { bench, describe } from 'vitest'

import { concatHex } from './concat.js'

const word = `0x${'a4e12a45'.repeat(8)}` as const

for (const count of [10, 1000]) {
  const values = Array.from({ length: count }, () => word)

  describe(`Concat Hex (${count} x 32 bytes)`, () => {
    bench('viem: `concatHex`', () => {
      concatHex(values)
    })

    bench('ethers: `concat`', () => {
      concatEthers(values)
    })
  })
}
