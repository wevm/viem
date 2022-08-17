import { expect, test } from 'vitest'

import * as address from './index'

test('exports address', () => {
  expect(address).toMatchInlineSnapshot(`
    {
      "checksumAddress": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
