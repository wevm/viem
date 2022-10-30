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
      "RpcHttpRequestError": [Function],
      "RpcTimeoutError": [Function],
      "TransactionRejectedRpcError": [Function],
      "buildRequest": [Function],
      "checksumAddress": [Function],
      "deserializeBlock": [Function],
      "deserializeTransactionResult": [Function],
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
      "hexToNumber": [Function],
      "numberToHex": [Function],
      "rpc": {
        "http": [Function],
        "webSocket": [Function],
        "webSocketAsync": [Function],
      },
      "serializeTransactionRequest": [Function],
      "transactionType": {
        "eip1559": "0x2",
        "eip2930": "0x1",
        "legacy": "0x0",
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
