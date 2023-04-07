import { expect, test } from 'vitest'

import * as actions from './index.js'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "call": [Function],
      "createBlockFilter": [Function],
      "createContractEventFilter": [Function],
      "createEventFilter": [Function],
      "createPendingTransactionFilter": [Function],
      "estimateContractGas": [Function],
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
      "getStorageAt": [Function],
      "getTransaction": [Function],
      "getTransactionConfirmations": [Function],
      "getTransactionCount": [Function],
      "getTransactionReceipt": [Function],
      "multicall": [Function],
      "readContract": [Function],
      "simulateContract": [Function],
      "uninstallFilter": [Function],
      "waitForTransactionReceipt": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
      "watchContractEvent": [Function],
      "watchEvent": [Function],
      "watchPendingTransactions": [Function],
    }
  `)
})
