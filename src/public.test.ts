import { expect, test } from 'vitest'

import * as public_ from './public.js'

test('exports public actions', () => {
  expect(Object.keys(public_)).toMatchInlineSnapshot(`
    [
      "call",
      "createBlockFilter",
      "createEventFilter",
      "createPendingTransactionFilter",
      "estimateGas",
      "getBalance",
      "getBlock",
      "getBlockNumber",
      "getBlockNumberCache",
      "getBlockTransactionCount",
      "getBytecode",
      "getChainId",
      "getFeeHistory",
      "estimateFeesPerGas",
      "getFilterChanges",
      "getFilterLogs",
      "getLogs",
      "getGasPrice",
      "estimateMaxPriorityFeePerGas",
      "getTransaction",
      "getTransactionConfirmations",
      "getTransactionCount",
      "getTransactionReceipt",
      "uninstallFilter",
      "waitForTransactionReceipt",
      "watchBlockNumber",
      "watchBlocks",
      "watchEvent",
      "watchPendingTransactions",
    ]
  `)
})
