import { expect, test } from 'vitest'

import * as providers from './index'

test('exports providers', () => {
  expect(providers).toMatchInlineSnapshot(`
    {
      "injectedProvider": [Function],
      "walletConnectProvider": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
