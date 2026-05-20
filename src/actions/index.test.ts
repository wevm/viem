import { expect, test } from 'vp/test'

import * as actions from 'viem/actions'

test('exports', () => {
  expect(Object.keys(actions).sort()).toMatchInlineSnapshot(`
    [
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
      "mine",
      "publicActions",
      "revert",
      "setBalance",
      "setCode",
      "setNonce",
      "setStorageAt",
      "snapshot",
      "testActions",
    ]
  `)
})
