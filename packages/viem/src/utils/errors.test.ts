import { expect, test } from 'vitest'

import * as errors from './errors'

test('exports errors', () => {
  expect(Object.keys(errors)).toMatchInlineSnapshot(`
    [
      "BaseError",
      "InvalidProviderError",
      "ProviderRpcError",
      "RpcError",
      "RequestError",
      "ParseRpcError",
      "InvalidRequestRpcError",
      "MethodNotFoundRpcError",
      "InvalidParamsRpcError",
      "InternalRpcError",
      "InvalidInputRpcError",
      "ResourceNotFoundRpcError",
      "ResourceUnavailableRpcError",
      "TransactionRejectedRpcError",
      "MethodNotSupportedRpcError",
      "LimitExceededRpcError",
      "JsonRpcVersionUnsupportedError",
    ]
  `)
})

test('BaseError', () => {
  expect(new errors.BaseError('test')).toMatchInlineSnapshot(`
      [Error: test
      Version: viem@1.0.2]
    `)
})

test('InvalidProviderError', () => {
  expect(
    new errors.InvalidProviderError({
      expectedProvider: 'accountProvider',
      givenProvider: 'walletProvider',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidProviderError: Invalid provider of type "walletProvider" provided
    Expected: "accountProvider"
    Version: viem@1.0.2]
  `)
})

test('RequestError', () => {
  expect(new errors.RequestError({ code: 1337, message: 'error details' }))
    .toMatchInlineSnapshot(`
      [RequestError: error details
      Version: viem@1.0.2]
    `)
})

test('RpcError', () => {
  expect(
    new errors.RpcError(
      { code: 1337, message: 'error details' },
      { humanMessage: 'An internal error was received.' },
    ),
  ).toMatchInlineSnapshot(`
    [RpcError: An internal error was received.

    Details: error details
    Version: viem@1.0.2]
  `)
})

test('RpcError', () => {
  expect(
    new errors.RpcError(
      { code: 1337, message: 'error details' },
      {
        humanMessage: 'An internal error was received.',
        docsLink: 'https://viem.sh',
      },
    ),
  ).toMatchInlineSnapshot(`
    [RpcError: An internal error was received.

    Docs: https://viem.sh

    Details: error details
    Version: viem@1.0.2]
  `)
})

test('ProviderRpcError', () => {
  expect(
    new errors.ProviderRpcError(
      { code: 1337, message: 'error details' },
      { humanMessage: 'An internal error was received.' },
    ),
  ).toMatchInlineSnapshot(`
    [ProviderRpcError: An internal error was received.

    Details: error details
    Version: viem@1.0.2]
  `)
})

test('ProviderRpcError', () => {
  expect(
    new errors.ProviderRpcError(
      { code: 1337, message: 'error details' },
      {
        humanMessage: 'An internal error was received.',
        docsLink: 'https://viem.sh',
      },
    ),
  ).toMatchInlineSnapshot(`
    [ProviderRpcError: An internal error was received.

    Docs: https://viem.sh

    Details: error details
    Version: viem@1.0.2]
  `)
})

test('ParseRpcError', () => {
  expect(
    new errors.ParseRpcError(<errors.RequestError>{
      code: -32700,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [ParseRpcError: Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('InvalidRequestRpcError', () => {
  expect(
    new errors.InvalidRequestRpcError(<errors.RequestError>{
      code: -32600,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidRequestRpcError: JSON is not a valid request object.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('MethodNotFoundRpcError', () => {
  expect(
    new errors.MethodNotFoundRpcError(<errors.RequestError>{
      code: -32601,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [MethodNotFoundRpcError: The method does not exist / is not available.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('InvalidParamsRpcError', () => {
  expect(
    new errors.InvalidParamsRpcError(<errors.RequestError>{
      code: -32602,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('InternalRpcError', () => {
  expect(
    new errors.InternalRpcError(<errors.RequestError>{
      code: -32603,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [InternalRpcError: An internal error was received.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('InvalidInputRpcError', () => {
  expect(
    new errors.InvalidInputRpcError(<errors.RequestError>{
      code: -32000,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidInputRpcError: Missing or invalid parameters.
    Double check you have provided the correct parameters.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('ResourceNotFoundRpcError', () => {
  expect(
    new errors.ResourceNotFoundRpcError(<errors.RequestError>{
      code: -32001,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [ResourceNotFoundRpcError: Requested resource not found.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('ResourceUnavailableRpcError', () => {
  expect(
    new errors.ResourceUnavailableRpcError(<errors.RequestError>{
      code: -32002,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [ResourceUnavailableRpcError: Requested resource not available.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('TransactionRejectedRpcError', () => {
  expect(
    new errors.TransactionRejectedRpcError(<errors.RequestError>{
      code: -32003,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [TransactionRejectedRpcError: Transaction creation failed.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('MethodNotSupportedRpcError', () => {
  expect(
    new errors.MethodNotSupportedRpcError(<errors.RequestError>{
      code: -32004,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [MethodNotSupportedRpcError: Method is not implemented.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('LimitExceededRpcError', () => {
  expect(
    new errors.LimitExceededRpcError(<errors.RequestError>{
      code: -32005,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [LimitExceededRpcError: Request exceeds defined limit.

    Details: message
    Version: viem@1.0.2]
  `)
})

test('JsonRpcVersionUnsupportedError', () => {
  expect(
    new errors.JsonRpcVersionUnsupportedError(<errors.RequestError>{
      code: -32006,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [JsonRpcVersionUnsupportedError: Version of JSON-RPC protocol is not supported.

    Details: message
    Version: viem@1.0.2]
  `)
})
