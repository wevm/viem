import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "dropTransaction": [Function],
      "getAutomine": [Function],
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
      "getTxpoolContent": [Function],
      "getTxpoolStatus": [Function],
      "impersonateAccount": [Function],
      "increaseTime": [Function],
      "inspectTxpool": [Function],
      "mine": [Function],
      "removeBlockTimestampInterval": [Function],
      "requestAccounts": [Function],
      "reset": [Function],
      "revert": [Function],
      "sendTransaction": [Function],
      "sendUnsignedTransaction": [Function],
      "setAutomine": [Function],
      "setBalance": [Function],
      "setBlockGasLimit": [Function],
      "setBlockTimestampInterval": [Function],
      "setCode": [Function],
      "setCoinbase": [Function],
      "setIntervalMining": [Function],
      "setLoggingEnabled": [Function],
      "setMinGasPrice": [Function],
      "setNextBlockBaseFeePerGas": [Function],
      "setNextBlockTimestamp": [Function],
      "setNonce": [Function],
      "setStorageAt": [Function],
      "snapshot": [Function],
      "stopImpersonatingAccount": [Function],
      "waitForTransactionReceipt": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
    }
  `)
})
