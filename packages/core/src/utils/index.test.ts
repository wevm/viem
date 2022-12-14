import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "BaseError": [Function],
      "HttpRequestError": [Function],
      "InternalRpcError": [Function],
      "InvalidInputRpcError": [Function],
      "InvalidParamsRpcError": [Function],
      "InvalidRequestRpcError": [Function],
      "JsonRpcVersionUnsupportedError": [Function],
      "LimitExceededRpcError": [Function],
      "MethodNotFoundRpcError": [Function],
      "MethodNotSupportedRpcError": [Function],
      "ParseRpcError": [Function],
      "ResourceNotFoundRpcError": [Function],
      "ResourceUnavailableRpcError": [Function],
      "RpcError": [Function],
      "RpcRequestError": [Function],
      "TimeoutError": [Function],
      "TransactionRejectedRpcError": [Function],
      "buildRequest": [Function],
      "checksumAddress": [Function],
      "displayToValue": [Function],
      "etherToValue": [Function],
      "etherUnits": {
        "gwei": 9,
        "wei": 18,
      },
      "format": [Function],
      "formatBlock": [Function],
      "formatTransaction": [Function],
      "gweiToValue": [Function],
      "gweiUnits": {
        "ether": -9,
        "wei": 9,
      },
      "hexToNumber": [Function],
      "numberToHex": [Function],
      "rpc": {
        "http": [Function],
        "webSocket": [Function],
        "webSocketAsync": [Function],
      },
      "serializeTransactionRequest": [Function],
      "transactionType": {
        "0x0": "legacy",
        "0x1": "eip2930",
        "0x2": "eip1559",
      },
      "valueAsEther": [Function],
      "valueAsGwei": [Function],
      "valueToDisplay": [Function],
      "weiUnits": {
        "ether": -18,
        "gwei": -9,
      },
    }
  `)
})
