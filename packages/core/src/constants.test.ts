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
      "transactionType": {
        "0x0": "legacy",
        "0x1": "eip2930",
        "0x2": "eip1559",
      },
      "weiUnits": {
        "ether": -18,
        "gwei": -9,
      },
    }
  `)
})
