import { expect, test } from 'vitest'

import { BaseError, RpcError, TimeoutError } from '../errors'
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

test('BaseError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject(new BaseError('foo', { details: 'bar' })),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [ViemError: foo

      Details: bar
      Version: viem@1.0.2]
    `)
  }
})

test('ParseRpcError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32700, message: 'message' },
        }),
      ),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [ParseRpcError: Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.

      Details: message
      Version: viem@1.0.2]
    `)
  }
})

test('InvalidRpcRequestError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32600, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32601, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32602, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32603, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32000, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32001, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32002, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32003, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32004, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32005, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32006, message: 'message' },
        }),
      ),
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
      Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32602, message: 'message' },
        }),
      ),
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
  await expect(() =>
    buildRequest(() => Promise.reject(new Error('wat')))(),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "An unknown RPC error occurred.

    Details: wat
    Version: viem@1.0.2"
  `)
})

test('TimeoutError', async () => {
  try {
    await buildRequest(() =>
      Promise.reject(
        new TimeoutError({
          body: { foo: 'bar' },
          url: 'http://localhost:8000',
        }),
      ),
    )()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [TimeoutError: The request took too long to respond.

      URL: http://localhost:8000
      Request body: {"foo":"bar"}

      Details: The request timed out.
      Version: viem@1.0.2]
    `)
  }
})

test('Unknown error', async () => {
  try {
    await buildRequest(() => Promise.reject(new Error('wagmi')))()
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [UnknownRpcError: An unknown RPC error occurred.

      Details: wagmi
      Version: viem@1.0.2]
    `)
  }
})

test('retries: BaseError (should not retry)', async () => {
  let retryCount = -1
  await expect(() =>
    buildRequest(() => {
      retryCount++
      return Promise.reject(new BaseError('foo', { details: 'bar' }))
    })(),
  ).rejects.toThrowError()
  expect(retryCount).toBe(0)
})

test('retries: InternalRpcError', async () => {
  let retryCount = -1
  await expect(() =>
    buildRequest(() => {
      retryCount++
      return Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32603, message: 'message' },
        }),
      )
    })(),
  ).rejects.toThrowError()
  expect(retryCount).toBe(3)
})

test('retries: LimitExceededRpcError', async () => {
  let retryCount = -1
  await expect(() =>
    buildRequest(() => {
      retryCount++
      return Promise.reject(
        new RpcError({
          body: { foo: 'bar' },
          url: 'https://viem.sh',
          error: { code: -32005, message: 'message' },
        }),
      )
    })(),
  ).rejects.toThrowError()
  expect(retryCount).toBe(3)
})

test('retries: UnknownRpcError', async () => {
  let retryCount = -1
  await expect(() =>
    buildRequest(() => {
      retryCount++
      return Promise.reject(new Error('wat'))
    })(),
  ).rejects.toThrowError()
  expect(retryCount).toBe(3)
})
