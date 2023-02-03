import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "call": [Function],
      "createBlockFilter": [Function],
      "createPendingTransactionFilter": [Function],
      "deployContract": [Function],
      "estimateGas": [Function],
      "getBalance": [Function],
      "getBlock": [Function],
      "getBlockNumber": [Function],
      "getBlockNumberCache": [Function],
      "getBlockTransactionCount": [Function],
      "getBytecode": [Function],
      "getChainId": [Function],
      "getFeeHistory": [Function],
      "getFilterChanges": [Function],
      "getFilterLogs": [Function],
      "getGasPrice": [Function],
      "getLogs": [Function],
      "getTransaction": [Function],
      "getTransactionConfirmations": [Function],
      "getTransactionCount": [Function],
      "getTransactionReceipt": [Function],
      "simulateContract": [Function],
      "uninstallFilter": [Function],
      "waitForTransactionReceipt": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
      "watchPendingTransactions": [Function],
    }
  `)
})
