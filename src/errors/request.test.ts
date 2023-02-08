import { expect, test } from 'vitest'
import {
  InternalRpcError,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  JsonRpcVersionUnsupportedError,
  LimitExceededRpcError,
  MethodNotFoundRpcError,
  MethodNotSupportedRpcError,
  ParseRpcError,
  RequestError,
  ResourceNotFoundRpcError,
  ResourceUnavailableRpcError,
  RpcRequestError,
  TransactionRejectedRpcError,
  UnknownRpcError,
} from './request'
import { RpcError } from './rpc'

test('RequestError', () => {
  expect(
    new RequestError(
      new RpcError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: { code: 1337, message: 'error details' },
      }),
      {
        shortMessage: 'An internal error was received.',
      },
    ),
  ).toMatchInlineSnapshot(`
    [RpcError: An internal error was received.

    Details: error details
    Version: viem@1.0.2]
  `)
})

test('RpcRequestError', () => {
  expect(
    new RpcRequestError(
      new RpcError({
        body: { foo: 'bar' },
        url: 'https://viem.sh',
        error: { code: 1337, message: 'error details' },
      }),
      { shortMessage: 'An internal error was received.' },
    ),
  ).toMatchInlineSnapshot(`
    [RpcError: An internal error was received.

    Details: error details
    Version: viem@1.0.2]
  `)
})

test('RpcRequestError', () => {
  expect(
    new RpcRequestError(
      new RpcError({
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
    [RpcError: An internal error was received.

    Docs: https://viem.sh/lol
    Details: error details
    Version: viem@1.0.2]
  `)
})

test('ParseRpcError', () => {
  expect(
    new ParseRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('InvalidRequestRpcError', () => {
  expect(
    new InvalidRequestRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('MethodNotFoundRpcError', () => {
  expect(
    new MethodNotFoundRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('InvalidParamsRpcError', () => {
  expect(
    new InvalidParamsRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('InternalRpcError', () => {
  expect(
    new InternalRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('InvalidInputRpcError', () => {
  expect(
    new InvalidInputRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('ResourceNotFoundRpcError', () => {
  expect(
    new ResourceNotFoundRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('ResourceUnavailableRpcError', () => {
  expect(
    new ResourceUnavailableRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('TransactionRejectedRpcError', () => {
  expect(
    new TransactionRejectedRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('MethodNotSupportedRpcError', () => {
  expect(
    new MethodNotSupportedRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('LimitExceededRpcError', () => {
  expect(
    new LimitExceededRpcError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('JsonRpcVersionUnsupportedError', () => {
  expect(
    new JsonRpcVersionUnsupportedError(
      new RpcError({
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

    Details: message
    Version: viem@1.0.2]
  `)
})

test('UnknownRpcError', async () => {
  expect(new UnknownRpcError(new Error('oh no'))).toMatchInlineSnapshot(`
    [UnknownRpcError: An unknown RPC error occurred.

    Details: oh no
    Version: viem@1.0.2]
  `)
})
