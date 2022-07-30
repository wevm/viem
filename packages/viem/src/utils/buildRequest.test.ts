import { expect, test } from 'vitest'

import { buildRequest } from './buildRequest'

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
