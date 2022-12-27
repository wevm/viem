import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "getBalance": [Function],
      "getBlock": [Function],
      "getBlockNumber": [Function],
      "getBlockNumberCache": [Function],
      "getBlockTransactionCount": [Function],
      "getChainId": [Function],
      "getTransaction": [Function],
      "getTransactionConfirmations": [Function],
      "getTransactionCount": [Function],
      "getTransactionReceipt": [Function],
      "waitForTransactionReceipt": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
    }
  `)
})
