import { bench, describe } from 'vitest'

import { hexToNumber, hexToString } from './fromHex.js'

describe.skip('Hex to Number', () => {
  bench('viem: `hexToNumber`', () => {
    hexToNumber('0x1a4')
  })
})

describe.skip('Hex to String', () => {
  bench('viem: `hexToString`', () => {
    hexToString('0x48656c6c6f20576f726c6421')
  })
})
