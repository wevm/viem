import { expect, test } from 'vp/test'

import * as actions from 'viem/actions'

test('exports', () => {
  expect(Object.keys(actions).sort()).toMatchInlineSnapshot(`
    [
      "getAutomine",
      "getBalance",
      "getBlobBaseFee",
      "getBlock",
      "getBlockNumber",
      "getBlockTransactionCount",
      "getChainId",
      "getCode",
      "getGasPrice",
      "getStorageAt",
      "getTransactionCount",
      "increaseTime",
      "mine",
      "publicActions",
      "removeBlockTimestampInterval",
      "revert",
      "setAutomine",
      "setBalance",
      "setBlockTimestampInterval",
      "setCode",
      "setIntervalMining",
      "setNextBlockTimestamp",
      "setNonce",
      "setStorageAt",
      "snapshot",
      "testActions",
    ]
  `)
})
