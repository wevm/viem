import { expect, test } from 'vitest'

import * as constants from './constants'

test('exports constants', () => {
  expect(constants).toMatchInlineSnapshot(`
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
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
