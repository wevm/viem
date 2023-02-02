import { expect, test } from 'vitest'

import * as formatters from './index'

test('exports formatters', () => {
  expect(formatters).toMatchInlineSnapshot(`
    {
      "extract": [Function],
      "format": [Function],
      "formatBlock": [Function],
      "formatFeeHistory": [Function],
      "formatTransaction": [Function],
      "formatTransactionReceipt": [Function],
      "formatTransactionRequest": [Function],
    }
  `)
})
