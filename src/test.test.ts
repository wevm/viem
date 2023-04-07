import { expect, test } from 'vitest'

import * as test_ from './test.js'

test('exports test actions', () => {
  expect(Object.keys(test_)).toMatchInlineSnapshot(`
    [
      "dropTransaction",
      "getAutomine",
      "getTxpoolContent",
      "getTxpoolStatus",
      "impersonateAccount",
      "increaseTime",
      "inspectTxpool",
      "mine",
      "removeBlockTimestampInterval",
      "reset",
      "revert",
      "sendUnsignedTransaction",
      "setAutomine",
      "setBalance",
      "setBlockGasLimit",
      "setBlockTimestampInterval",
      "setCode",
      "setCoinbase",
      "setIntervalMining",
      "setLoggingEnabled",
      "setMinGasPrice",
      "setNextBlockBaseFeePerGas",
      "setNextBlockTimestamp",
      "setNonce",
      "setStorageAt",
      "snapshot",
      "setRpcUrl",
      "stopImpersonatingAccount",
    ]
  `)
})
