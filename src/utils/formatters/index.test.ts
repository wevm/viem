import { expect, test } from 'vitest'

import * as formatters from './index.js'

test('exports formatters', () => {
  expect(formatters).toMatchInlineSnapshot(`
    {
      "defineBlock": [Function],
      "defineFormatter": [Function],
      "defineTransaction": [Function],
      "defineTransactionReceipt": [Function],
      "defineTransactionRequest": [Function],
      "extract": [Function],
      "format": [Function],
      "formatBlock": [Function],
      "formatFeeHistory": [Function],
      "formatTransaction": [Function],
      "formatTransactionReceipt": [Function],
      "formatTransactionRequest": [Function],
      "transactionType": {
        "0x0": "legacy",
        "0x1": "eip2930",
        "0x2": "eip1559",
      },
    }
  `)
})
