import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "deserializeTransactionResult": [Function],
      "serializeTransactionRequest": [Function],
      "transactionType": {
        "eip1559": "0x2",
        "eip2930": "0x1",
        "legacy": "0x0",
      },
    }
  `)
})
