import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "BaseError": [Function],
      "BlockNotFoundError": [Function],
      "InternalRpcError": [Function],
      "InvalidInputRpcError": [Function],
      "InvalidParamsRpcError": [Function],
      "InvalidProviderError": [Function],
      "InvalidRequestRpcError": [Function],
      "JsonRpcVersionUnsupportedError": [Function],
      "LimitExceededRpcError": [Function],
      "MethodNotFoundRpcError": [Function],
      "MethodNotSupportedRpcError": [Function],
      "ParseRpcError": [Function],
      "ProviderRpcError": [Function],
      "RequestError": [Function],
      "ResourceNotFoundRpcError": [Function],
      "ResourceUnavailableRpcError": [Function],
      "RpcError": [Function],
      "TransactionRejectedRpcError": [Function],
      "buildRequest": [Function],
      "etherValue": [Function],
      "gweiValue": [Function],
      "numberToHex": [Function],
      "request": [Function],
      "rpc": {
        "http": [Function],
      },
      "toUnit": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
