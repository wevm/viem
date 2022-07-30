import { expect, test } from 'vitest'

import * as providers from './index'

test('exports providers', () => {
  expect(providers).toMatchInlineSnapshot(`
    {
      "alchemyProvider": [Function],
      "jsonRpcProvider": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
