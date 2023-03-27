import { expect, test } from 'vitest'

import * as actions from './index.js'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "dropTransaction": [Function],
      "getAutomine": [Function],
      "getTxpoolContent": [Function],
      "getTxpoolStatus": [Function],
      "impersonateAccount": [Function],
      "increaseTime": [Function],
      "inspectTxpool": [Function],
      "mine": [Function],
      "removeBlockTimestampInterval": [Function],
      "reset": [Function],
      "revert": [Function],
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
      "setRpcUrl": [Function],
      "setStorageAt": [Function],
      "snapshot": [Function],
      "stopImpersonatingAccount": [Function],
    }
  `)
})
