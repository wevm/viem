import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "getTransaction": [Function],
      "getTransactionConfirmations": [Function],
      "getTransactionReceipt": [Function],
      "sendTransaction": [Function],
      "waitForTransactionReceipt": [Function],
    }
  `)
})
