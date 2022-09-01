import { expect, test } from 'vitest'

import { BaseError } from './BaseError'

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
  RpcError,
  TransactionRejectedRpcError,
  buildRequest,
} from './buildRequest'

test('valid request', async () => {
  expect(
    await buildRequest((args) => Promise.resolve({ ok: true, ...args }))({
      foo: 'bar',
    }),
  ).toMatchInlineSnapshot(`
    {
      "foo": "bar",
      "ok": true,
    }
  `)
})

test('BaseError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject(new BaseError({ humanMessage: 'foo', details: 'bar' })),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [RpcError: foo

      Details: bar
      Version: viem@1.0.2]
    `)
  }
})

test('ParseRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32700, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [ParseRpcError: Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('InvalidRequestError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32600, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [InvalidRequestRpcError: JSON is not a valid request object.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('MethodNotFoundRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32601, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [MethodNotFoundRpcError: The method does not exist / is not available.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('InvalidParamsRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32602, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
      Double check you have provided the correct parameters.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('InternalRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32603, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [InternalRpcError: An internal error was received.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('InvalidInputRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32000, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [InvalidInputRpcError: Missing or invalid parameters.
      Double check you have provided the correct parameters.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('ResourceNotFoundRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32001, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [ResourceNotFoundRpcError: Requested resource not found.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('ResourceUnavailableRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32002, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [ResourceUnavailableRpcError: Requested resource not available.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('TransactionRejectedRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32003, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [TransactionRejectedRpcError: Transaction creation failed.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('MethodNotSupportedRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32004, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [MethodNotSupportedRpcError: Method is not implemented.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('LimitExceededRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32005, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [LimitExceededRpcError: Request exceeds defined limit.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('JsonRpcVersionUnsupportedError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32006, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [JsonRpcVersionUnsupportedError: Version of JSON-RPC protocol is not supported.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('InvalidParamsRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject({ code: -32602, message: 'message' }),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
      Double check you have provided the correct parameters.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('Error', async () => {
  try {
    await buildRequest(() => Promise.reject({ code: 69, message: 'message' }))()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [RpcError: An unknown error occurred.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('RequestError', () => {
  expect(new RequestError({ code: 1337, message: 'error details' }))
    .toMatchInlineSnapshot(`
      [RequestError: Could not make request.

      Details: error details
      Version: viem@1.0.2]
    `)
})

test('RpcError', () => {
  expect(
    new RpcError(
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
    new RpcError(
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

test('ParseRpcError', () => {
  expect(
    new ParseRpcError(<RequestError>{
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
    new InvalidRequestRpcError(<RequestError>{
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
    new MethodNotFoundRpcError(<RequestError>{
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
    new InvalidParamsRpcError(<RequestError>{
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
    new InternalRpcError(<RequestError>{
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
    new InvalidInputRpcError(<RequestError>{
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
    new ResourceNotFoundRpcError(<RequestError>{
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
    new ResourceUnavailableRpcError(<RequestError>{
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
    new TransactionRejectedRpcError(<RequestError>{
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
    new MethodNotSupportedRpcError(<RequestError>{
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
    new LimitExceededRpcError(<RequestError>{
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
    new JsonRpcVersionUnsupportedError(<RequestError>{
      code: -32006,
      message: 'message',
    }),
  ).toMatchInlineSnapshot(`
    [JsonRpcVersionUnsupportedError: Version of JSON-RPC protocol is not supported.

    Details: message
    Version: viem@1.0.2]
  `)
})
