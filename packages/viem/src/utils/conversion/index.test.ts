import { expect, test } from 'vitest'

import * as conversion from './index'

test('exports conversion', () => {
  expect(conversion).toMatchInlineSnapshot(`
    {
      "etherToWei": [Function],
      "etherValue": [Function],
      "gweiPerEther": 1000000000,
      "gweiToWei": [Function],
      "gweiValue": [Function],
      "weiPerEther": 1000000000000000000,
      "weiPerGwei": 1000000000,
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
