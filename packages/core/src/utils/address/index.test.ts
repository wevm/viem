import { expect, test } from 'vitest'

import * as address from './index'

test('exports address', () => {
  expect(address).toMatchInlineSnapshot(`
    {
      "getAddress": [Function],
      "isAddress": [Function],
      "isAddressEqual": [Function],
    }
  `)
})
