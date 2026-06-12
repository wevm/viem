import { expect, test } from 'vitest'

import * as unit from './unit.js'

test('exports unit', () => {
  expect(unit).toMatchInlineSnapshot(`
    {
      "etherUnits": {
        "gwei": 9,
        "wei": 18,
      },
      "gweiUnits": {
        "ether": -9,
        "wei": 9,
      },
      "weiUnits": {
        "ether": -18,
        "gwei": -9,
      },
    }
  `)
})
