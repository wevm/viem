import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "fetchTransaction": [Function],
      "fetchTransactionReceipt": [Function],
      "sendTransaction": [Function],
      "waitForTransactionReceipt": [Function],
    }
  `)
})
