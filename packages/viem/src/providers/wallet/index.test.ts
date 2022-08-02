import { expect, test } from 'vitest'

import * as providers from './index'

test('exports providers', () => {
  expect(providers).toMatchInlineSnapshot(`
    {
      "accountProvider": [Function],
      "externalProvider": [Function],
      "injectedProvider": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
