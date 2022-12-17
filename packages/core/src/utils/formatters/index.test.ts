import { expect, test } from 'vitest'

import * as formatters from './index'

test('exports formatters', () => {
  expect(formatters).toMatchInlineSnapshot(`
    {
      "format": [Function],
      "formatBlock": [Function],
      "formatTransaction": [Function],
      "formatTransactionRequest": [Function],
    }
  `)
})
