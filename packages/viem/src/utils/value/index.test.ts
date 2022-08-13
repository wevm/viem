import { expect, test } from 'vitest'

import * as value from './index'

test('exports value utils', () => {
  expect(value).toMatchInlineSnapshot(`
    {
      "etherValue": [Function],
      "gweiValue": [Function],
      "toValue": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
