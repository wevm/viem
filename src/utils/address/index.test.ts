import { expect, test } from 'vitest'

import * as address from './index.js'

test('exports address', () => {
  expect(address).toMatchInlineSnapshot(`
    {
      "checksumAddress": [Function],
      "getAddress": [Function],
      "getContractAddress": [Function],
      "getCreate2Address": [Function],
      "getCreateAddress": [Function],
      "isAddress": [Function],
      "isAddressEqual": [Function],
    }
  `)
})
