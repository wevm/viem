import { expect, test } from 'vitest'

import * as value from './index'

test('exports value utils', () => {
  expect(value).toMatchInlineSnapshot(`
    {
      "displayToValue": [Function],
      "etherToValue": [Function],
      "etherUnits": {
        "gwei": 9,
        "wei": 18,
      },
      "gweiToValue": [Function],
      "gweiUnits": {
        "ether": -9,
        "wei": 9,
      },
      "valueAsEther": [Function],
      "valueAsGwei": [Function],
      "valueToDisplay": [Function],
      "weiUnits": {
        "ether": -18,
        "gwei": -9,
      },
    }
  `)
})
