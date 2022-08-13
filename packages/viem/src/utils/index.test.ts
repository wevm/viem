import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "BaseError": [Function],
      "InternalRpcError": [Function],
      "InvalidInputRpcError": [Function],
      "InvalidParamsRpcError": [Function],
      "InvalidRequestRpcError": [Function],
      "JsonRpcVersionUnsupportedError": [Function],
      "LimitExceededRpcError": [Function],
      "MethodNotFoundRpcError": [Function],
      "MethodNotSupportedRpcError": [Function],
      "ParseRpcError": [Function],
      "RequestError": [Function],
      "ResourceNotFoundRpcError": [Function],
      "ResourceUnavailableRpcError": [Function],
      "RpcError": [Function],
      "TransactionRejectedRpcError": [Function],
      "buildRequest": [Function],
      "displayToValue": [Function],
      "etherToValue": [Function],
      "etherUnits": {
        "gwei": 9,
        "wei": 18,
      },
      "gweiToValue": [Function],
      "gweiUnits": {
        "ether": -9,
        "wei": 9,
      },
      "numberToHex": [Function],
      "request": [Function],
      "rpc": {
        "http": [Function],
      },
      "valueAsEther": [Function],
      "valueAsGwei": [Function],
      "valueToDisplay": [Function],
      "weiUnits": {
        "ether": -18,
        "gwei": -9,
      },
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
