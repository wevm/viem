import { expect, test } from 'vitest'

import * as conversion from './index'

test('exports conversion', () => {
  expect(conversion).toMatchInlineSnapshot(`
    {
      "etherToWei": [Function],
      "weiPerEther": 1000000000000000000,
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
