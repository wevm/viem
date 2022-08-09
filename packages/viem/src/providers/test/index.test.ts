import { expect, test } from 'vitest'

import * as providers from './index'

test('exports providers', () => {
  expect(providers).toMatchInlineSnapshot(`
    {
      "anvilProvider": [Function],
      "hardhatProvider": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
