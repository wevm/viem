import { expect, test } from 'vitest'

import { RpcRequestError } from './request.js'
import {
  ChainDisconnectedError,
  InternalRpcError,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  JsonRpcVersionUnsupportedError,
  LimitExceededRpcError,
  MethodNotFoundRpcError,
  MethodNotSupportedRpcError,
  ParseRpcError,
  ProviderDisconnectedError,
  ProviderRpcError,
  ResourceNotFoundRpcError,
  ResourceUnavailableRpcError,
  RpcError,
  SwitchChainError,
  TransactionRejectedRpcError,
  UnauthorizedProviderError,
  UnknownRpcError,
  UnsupportedProviderMethodError,
  UserRejectedRequestError,
} from './rpc.js'

test('RpcError', () => {
  expect(
    new RpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: { code: 1337, message: 'error details' },
      }),
      {
        code: 1337,
        shortMessage: 'An internal error was received.',
      },
    ),
  ).toMatchInlineSnapshot(`
    [RpcRequestError: An internal error was received.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: error details
    Version: viem@x.y.z]
  `)
})

test('RpcError', () => {
  expect(
    new RpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: { code: 1337, message: 'error details' },
      }),
      {
        shortMessage: 'An internal error was received.',
        docsPath: '/lol',
      },
    ),
  ).toMatchInlineSnapshot(`
    [RpcRequestError: An internal error was received.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Docs: https://viem.sh/lol
    Details: error details
    Version: viem@x.y.z]
  `)
})

test('ProviderRpcError', () => {
  expect(
    new ProviderRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: { code: 1337, message: 'error details' },
      }),
      {
        shortMessage: 'An internal error was received.',
      },
    ),
  ).toMatchInlineSnapshot(`
    [RpcRequestError: An internal error was received.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: error details
    Version: viem@x.y.z]
  `)
})

test('ParseRpcError', () => {
  expect(
    new ParseRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32700,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [ParseRpcError: Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('InvalidRequestRpcError', () => {
  expect(
    new InvalidRequestRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32600,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [InvalidRequestRpcError: JSON is not a valid request object.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('MethodNotFoundRpcError', () => {
  expect(
    new MethodNotFoundRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32601,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [MethodNotFoundRpcError: The method does not exist / is not available.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('InvalidParamsRpcError', () => {
  expect(
    new InvalidParamsRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32602,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('InternalRpcError', () => {
  expect(
    new InternalRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32603,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [InternalRpcError: An internal error was received.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('InvalidInputRpcError', () => {
  expect(
    new InvalidInputRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32000,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [InvalidInputRpcError: Missing or invalid parameters.
    Double check you have provided the correct parameters.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('ResourceNotFoundRpcError', () => {
  expect(
    new ResourceNotFoundRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32001,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [ResourceNotFoundRpcError: Requested resource not found.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('ResourceUnavailableRpcError', () => {
  expect(
    new ResourceUnavailableRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32002,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [ResourceUnavailableRpcError: Requested resource not available.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('TransactionRejectedRpcError', () => {
  expect(
    new TransactionRejectedRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32003,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [TransactionRejectedRpcError: Transaction creation failed.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('MethodNotSupportedRpcError', () => {
  expect(
    new MethodNotSupportedRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32004,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [MethodNotSupportedRpcError: Method is not implemented.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('LimitExceededRpcError', () => {
  expect(
    new LimitExceededRpcError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32005,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [LimitExceededRpcError: Request exceeds defined limit.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('JsonRpcVersionUnsupportedError', () => {
  expect(
    new JsonRpcVersionUnsupportedError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: -32006,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [JsonRpcVersionUnsupportedError: Version of JSON-RPC protocol is not supported.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('UserRejectedRequestError', () => {
  expect(
    new UserRejectedRequestError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: 4001,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [UserRejectedRequestError: User rejected the request.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)

  expect(
    new UserRejectedRequestError(
      new Error('An arbitrary error from a Provider SDK'),
    ),
  ).toMatchInlineSnapshot(`
    [UserRejectedRequestError: User rejected the request.

    Details: An arbitrary error from a Provider SDK
    Version: viem@x.y.z]
  `)
})

test('UnauthorizedProviderError', () => {
  expect(
    new UnauthorizedProviderError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: 4001,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [UnauthorizedProviderError: The requested method and/or account has not been authorized by the user.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)

  expect(
    new UnauthorizedProviderError(
      new Error('An arbitrary error from a Provider SDK'),
    ),
  ).toMatchInlineSnapshot(`
    [UnauthorizedProviderError: The requested method and/or account has not been authorized by the user.

    Details: An arbitrary error from a Provider SDK
    Version: viem@x.y.z]
  `)
})

test('UnsupportedProviderMethodError', () => {
  expect(
    new UnsupportedProviderMethodError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: 4001,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [UnsupportedProviderMethodError: The Provider does not support the requested method.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)

  expect(
    new UnsupportedProviderMethodError(
      new Error('An arbitrary error from a Provider SDK'),
    ),
  ).toMatchInlineSnapshot(`
    [UnsupportedProviderMethodError: The Provider does not support the requested method.

    Details: An arbitrary error from a Provider SDK
    Version: viem@x.y.z]
  `)
})

test('ProviderDisconnectedError', () => {
  expect(
    new ProviderDisconnectedError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: 4001,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [ProviderDisconnectedError: The Provider is disconnected from all chains.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)

  expect(
    new ProviderDisconnectedError(
      new Error('An arbitrary error from a Provider SDK'),
    ),
  ).toMatchInlineSnapshot(`
    [ProviderDisconnectedError: The Provider is disconnected from all chains.

    Details: An arbitrary error from a Provider SDK
    Version: viem@x.y.z]
  `)
})

test('ChainDisconnectedError', () => {
  expect(
    new ChainDisconnectedError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: 4001,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [ChainDisconnectedError: The Provider is not connected to the requested chain.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)

  expect(
    new ChainDisconnectedError(
      new Error('An arbitrary error from a Provider SDK'),
    ),
  ).toMatchInlineSnapshot(`
    [ChainDisconnectedError: The Provider is not connected to the requested chain.

    Details: An arbitrary error from a Provider SDK
    Version: viem@x.y.z]
  `)
})

test('SwitchChainError', () => {
  expect(
    new SwitchChainError(
      new RpcRequestError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: {
          code: 4902,
          message: 'message',
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    [SwitchChainError: An error occurred when attempting to switch chain.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: message
    Version: viem@x.y.z]
  `)
})

test('UnknownRpcError', async () => {
  expect(new UnknownRpcError(new Error('oh no'))).toMatchInlineSnapshot(`
    [UnknownRpcError: An unknown RPC error occurred.

    Details: oh no
    Version: viem@x.y.z]
  `)
})
