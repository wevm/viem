import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "fetchBalance": [Function],
      "requestAccountAddresses": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
