import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "HDKey": [Function],
      "parseAccount": [Function],
      "privateKeyToAccount": [Function],
      "publicKeyToAddress": [Function],
      "signMessage": [Function],
      "toAccount": [Function],
    }
  `)
})
