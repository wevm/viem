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
      "getFilterChanges",
      "getFilterLogs",
      "getLogs",
      "getGasPrice",
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
