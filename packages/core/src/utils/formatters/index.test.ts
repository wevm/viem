import { expect, test } from 'vitest'

import * as formatters from './index'

test('exports formatters', () => {
  expect(formatters).toMatchInlineSnapshot(`
    {
      "format": [Function],
      "formatBlock": [Function],
      "formatTransaction": [Function],
      "formatTransactionRequest": [Function],
      "transactionType": {
        "0x0": "legacy",
        "0x1": "eip2930",
        "0x2": "eip1559",
      },
    }
  `)
})
