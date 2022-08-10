import { expect, test } from 'vitest'

import * as number from './index'

test('exports number', () => {
  expect(number).toMatchInlineSnapshot(`
    {
      "numberToHex": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
