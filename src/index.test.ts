import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "AbiConstructorNotFoundError": [Function],
      "AbiConstructorParamsNotFoundError": [Function],
      "AbiDecodingDataSizeInvalidError": [Function],
      "AbiEncodingArrayLengthMismatchError": [Function],
      "AbiEncodingLengthMismatchError": [Function],
      "AbiErrorInputsNotFoundError": [Function],
      "AbiErrorNotFoundError": [Function],
      "AbiErrorSignatureNotFoundError": [Function],
      "AbiEventNotFoundError": [Function],
      "AbiFunctionNotFoundError": [Function],
      "AbiFunctionOutputsNotFoundError": [Function],
      "AbiFunctionSignatureNotFoundError": [Function],
      "BaseError": [Function],
      "BlockNotFoundError": [Function],
      "ContractFunctionExecutionError": [Function],
      "ContractFunctionRevertedError": [Function],
      "ContractFunctionZeroDataError": [Function],
      "DataLengthTooLongError": [Function],
      "DataLengthTooShortError": [Function],
      "FilterTypeNotSupportedError": [Function],
      "HttpRequestError": [Function],
      "InternalRpcError": [Function],
      "InvalidAbiDecodingTypeError": [Function],
      "InvalidAbiEncodingTypeError": [Function],
      "InvalidAddressError": [Function],
      "InvalidArrayError": [Function],
      "InvalidBytesBooleanError": [Function],
      "InvalidDefinitionTypeError": [Function],
      "InvalidGasArgumentsError": [Function],
      "InvalidHexBooleanError": [Function],
      "InvalidHexValueError": [Function],
      "InvalidInputRpcError": [Function],
      "InvalidParamsRpcError": [Function],
      "InvalidRequestRpcError": [Function],
      "JsonRpcVersionUnsupportedError": [Function],
      "LimitExceededRpcError": [Function],
      "MethodNotFoundRpcError": [Function],
      "MethodNotSupportedRpcError": [Function],
      "OffsetOutOfBoundsError": [Function],
      "ParseRpcError": [Function],
      "RequestError": [Function],
      "ResourceNotFoundRpcError": [Function],
      "ResourceUnavailableRpcError": [Function],
      "RpcError": [Function],
      "RpcRequestError": [Function],
      "SizeExceedsPaddingSizeError": [Function],
      "TimeoutError": [Function],
      "TransactionNotFoundError": [Function],
      "TransactionReceiptNotFoundError": [Function],
      "TransactionRejectedRpcError": [Function],
      "UnknownRpcError": [Function],
      "UrlRequiredError": [Function],
      "WaitForTransactionReceiptTimeoutError": [Function],
      "WebSocketRequestError": [Function],
      "createClient": [Function],
      "createPublicClient": [Function],
      "createTestClient": [Function],
      "createTransport": [Function],
      "createWalletClient": [Function],
      "custom": [Function],
      "fallback": [Function],
      "http": [Function],
      "multicall3Abi": [
        {
          "inputs": [
            {
              "components": [
                {
                  "name": "target",
                  "type": "address",
                },
                {
                  "name": "allowFailure",
                  "type": "bool",
                },
                {
                  "name": "callData",
                  "type": "bytes",
                },
              ],
              "name": "calls",
              "type": "tuple[]",
            },
          ],
          "name": "aggregate3",
          "outputs": [
            {
              "components": [
                {
                  "name": "success",
                  "type": "bool",
                },
                {
                  "name": "returnData",
                  "type": "bytes",
                },
              ],
              "name": "returnData",
              "type": "tuple[]",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "webSocket": [Function],
    }
  `)
})
