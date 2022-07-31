import { expect, test } from 'vitest'

import * as signers from './index'

test('exports signers', () => {
  expect(signers).toMatchInlineSnapshot(`
    {
      "getProviderAccount": [Function],
      "watchProviderAccount": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
