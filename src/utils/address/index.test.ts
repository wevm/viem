import { expect, test } from 'vitest'

import * as address from './index'

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
      "recoverAddress": [Function],
    }
  `)
})
