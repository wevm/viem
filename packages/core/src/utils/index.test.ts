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
      "bytesToHex": [Function],
      "decodeHex": [Function],
      "encodeHex": [Function],
      "format": [Function],
      "formatBlock": [Function],
      "formatEther": [Function],
      "formatGwei": [Function],
      "formatTransaction": [Function],
      "formatTransactionRequest": [Function],
      "formatUnit": [Function],
      "getAddress": [Function],
      "hexToBigInt": [Function],
      "hexToBytes": [Function],
      "hexToNumber": [Function],
      "hexToString": [Function],
      "isAddress": [Function],
      "isAddressEqual": [Function],
      "keccak256": [Function],
      "numberToHex": [Function],
      "parseEther": [Function],
      "parseGwei": [Function],
      "parseUnit": [Function],
      "rpc": {
        "http": [Function],
        "webSocket": [Function],
        "webSocketAsync": [Function],
      },
      "stringToHex": [Function],
    }
  `)
})
