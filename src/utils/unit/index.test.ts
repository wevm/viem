import { expect, test } from 'vitest'

import * as value from './index'

test('exports value utils', () => {
  expect(value).toMatchInlineSnapshot(`
    {
      "etherUnits": {
        "gwei": 9,
        "wei": 18,
      },
      "formatEther": [Function],
      "formatGwei": [Function],
      "formatUnit": [Function],
      "gweiUnits": {
        "ether": -9,
        "wei": 9,
      },
      "parseEther": [Function],
      "parseGwei": [Function],
      "parseUnit": [Function],
      "weiUnits": {
        "ether": -18,
        "gwei": -9,
      },
    }
  `)
})
