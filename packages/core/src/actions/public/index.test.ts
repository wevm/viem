import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "call": [Function],
      "createPendingTransactionFilter": [Function],
      "estimateGas": [Function],
      "getBalance": [Function],
      "getBlock": [Function],
      "getBlockNumber": [Function],
      "getBlockNumberCache": [Function],
      "getBlockTransactionCount": [Function],
      "getChainId": [Function],
      "getFeeHistory": [Function],
      "getFilterChanges": [Function],
      "getGasPrice": [Function],
      "getTransaction": [Function],
      "getTransactionConfirmations": [Function],
      "getTransactionCount": [Function],
      "getTransactionReceipt": [Function],
      "uninstallFilter": [Function],
      "waitForTransactionReceipt": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
      "watchPendingTransactions": [Function],
    }
  `)
})
