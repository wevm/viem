import { expect, test } from 'vitest'

import * as conversion from './index'

test('exports conversion', () => {
  expect(conversion).toMatchInlineSnapshot(`
    {
      "etherValue": [Function],
      "gweiValue": [Function],
      "toUnit": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
