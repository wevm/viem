import { bench, describe } from 'vitest'

import { hexToBigInt, hexToNumber, hexToString } from './fromHex.js'

describe('Hex to Number', () => {
  bench('viem: `hexToNumber`', () => {
    hexToNumber('0x1a4')
  })
})

describe('Hex to BigInt (signed, negative)', () => {
  bench('viem: `hexToBigInt`', () => {
    hexToBigInt(`0x${'f'.repeat(63)}e`, { signed: true })
  })
})

describe.skip('Hex to String', () => {
  bench('viem: `hexToString`', () => {
    hexToString('0x48656c6c6f20576f726c6421')
  })
})
