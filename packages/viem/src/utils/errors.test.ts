import { expect, test } from 'vitest'

import * as errors from './errors'

test('exports errors', () => {
  expect(Object.keys(errors)).toMatchInlineSnapshot(`
    [
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

test('RequestError', () => {
  expect(
    new errors.RequestError({ code: 1337, message: 'error details' }),
  ).toMatchInlineSnapshot('[RequestError: error details]')
})

test('RpcError', () => {
  expect(
    new errors.RpcError(
      { code: 1337, message: 'error details' },
      'An internal error was received.',
    ),
  ).toMatchInlineSnapshot(`
    [RpcError: An internal error was received.

    Details: error details]
  `)
})

test('ProviderRpcError', () => {
  expect(
    new errors.ProviderRpcError(
      { code: 1337, message: 'error details' },
      'An internal error was received.',
    ),
  ).toMatchInlineSnapshot(`
    [ProviderRpcError: An internal error was received.

    Details: error details]
  `)
})

test('ParseRpcError', () => {
  expect(
    new errors.ParseRpcError(
      new errors.RequestError({ code: -32700, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [ParseRpcError: Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.

    Details: message]
  `)
})

test('InvalidRequestRpcError', () => {
  expect(
    new errors.InvalidRequestRpcError(
      new errors.RequestError({ code: -32600, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [InvalidRequestRpcError: JSON is not a valid request object.

    Details: message]
  `)
})

test('MethodNotFoundRpcError', () => {
  expect(
    new errors.MethodNotFoundRpcError(
      new errors.RequestError({ code: -32601, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [MethodNotFoundRpcError: The method does not exist / is not available.

    Details: message]
  `)
})

test('InvalidParamsRpcError', () => {
  expect(
    new errors.InvalidParamsRpcError(
      new errors.RequestError({ code: -32602, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    Details: message]
  `)
})

test('InvalidParamsRpcError', () => {
  expect(
    new errors.InvalidParamsRpcError(
      new errors.RequestError({ code: -32602, message: 'message' }),
      { docsLink: 'https://viem.sh' },
    ),
  ).toMatchInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    Docs: https://sad.com/

    Details: message]
  `)
})

test('InternalRpcError', () => {
  expect(
    new errors.InternalRpcError(
      new errors.RequestError({ code: -32603, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [InternalRpcError: An internal error was received.

    Details: message]
  `)
})

test('InvalidInputRpcError', () => {
  expect(
    new errors.InvalidInputRpcError(
      new errors.RequestError({ code: -32000, message: 'message' }),
      { docsLink: 'https://viem.sh' },
    ),
  ).toMatchInlineSnapshot(`
    [InvalidInputRpcError: Missing or invalid parameters.
    Double check you have provided the correct parameters.

    Docs: https://viem.sh

    Details: message]
  `)
})

test('InvalidInputRpcError', () => {
  expect(
    new errors.InvalidInputRpcError(
      new errors.RequestError({ code: -32000, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [InvalidInputRpcError: Missing or invalid parameters.
    Double check you have provided the correct parameters.

    Details: message]
  `)
})

test('ResourceNotFoundRpcError', () => {
  expect(
    new errors.ResourceNotFoundRpcError(
      new errors.RequestError({ code: -32001, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [ResourceNotFoundRpcError: Requested resource not found.

    Details: message]
  `)
})

test('ResourceUnavailableRpcError', () => {
  expect(
    new errors.ResourceUnavailableRpcError(
      new errors.RequestError({ code: -32002, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [ResourceUnavailableRpcError: Requested resource not available.

    Details: message]
  `)
})

test('TransactionRejectedRpcError', () => {
  expect(
    new errors.TransactionRejectedRpcError(
      new errors.RequestError({ code: -32003, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [TransactionRejectedRpcError: Transaction creation failed.

    Details: message]
  `)
})

test('MethodNotSupportedRpcError', () => {
  expect(
    new errors.MethodNotSupportedRpcError(
      new errors.RequestError({ code: -32004, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [MethodNotSupportedRpcError: Method is not implemented.

    Details: message]
  `)
})

test('LimitExceededRpcError', () => {
  expect(
    new errors.LimitExceededRpcError(
      new errors.RequestError({ code: -32005, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [LimitExceededRpcError: Request exceeds defined limit.

    Details: message]
  `)
})

test('JsonRpcVersionUnsupportedError', () => {
  expect(
    new errors.JsonRpcVersionUnsupportedError(
      new errors.RequestError({ code: -32006, message: 'message' }),
    ),
  ).toMatchInlineSnapshot(`
    [JsonRpcVersionUnsupportedError: Version of JSON-RPC protocol is not supported.

    Details: message]
  `)
})
