import * as RpcResponse from 'ox/RpcResponse'
import { BaseError } from '../../errors/base.js'
import { RpcRequestError } from '../../errors/request.js'
import type * as Relay from '../Relay.js'

/** Largest request body, in bytes, read before JSON parsing; above reth's 15 MB default. */
const maxBodySize = 16 * 1_024 * 1_024

/** Adapts an RPC handler to the Fetch API without changing its method results. */
export async function fetch(
  request: Request,
  handler: Relay.handleRequest.Handler,
  options: Relay.handleRequest.RequestOptions = {},
): Promise<Response> {
  if (request.method !== 'POST')
    return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  const contentType = request.headers
    .get('content-type')
    ?.split(';')[0]
    ?.trim()
    .toLowerCase()
  if (contentType !== 'application/json')
    return new Response(null, { status: 415 })

  const body = await (async () => {
    try {
      const chunks = await readBody(request)
      if (!chunks)
        return {
          status: 413,
          error: {
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32600,
              message: `Request body exceeds ${maxBodySize / 1_024 / 1_024} MiB`,
            },
          },
        }
      return { value: (await new Response(new Blob(chunks)).json()) as unknown }
    } catch {
      return {
        error: {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error' },
        },
      }
    }
  })()
  if (body.error)
    return Response.json(body.error, body.status ? { status: body.status } : {})

  const requestOptions = {
    ...options,
    signal: options.signal ?? request.signal,
  }
  const handle = async (value: unknown) => {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      !('jsonrpc' in value) ||
      value.jsonrpc !== '2.0' ||
      !('method' in value) ||
      typeof value.method !== 'string' ||
      ('id' in value &&
        value.id !== null &&
        typeof value.id !== 'string' &&
        (typeof value.id !== 'number' || !Number.isFinite(value.id))) ||
      ('params' in value &&
        (value.params === null || typeof value.params !== 'object'))
    )
      return {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32600, message: 'Invalid Request' },
      }

    const id = 'id' in value ? value.id : undefined
    try {
      if ('params' in value && !Array.isArray(value.params))
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected positional RPC parameters.',
        })
      const metadata = {}
      const result = await handler(
        {
          method: value.method,
          ...('params' in value
            ? { params: value.params as readonly unknown[] }
            : {}),
        },
        {
          ...requestOptions,
          response: metadata,
        } as Relay.handleRequest.RequestOptions,
      )
      if (id === undefined) return undefined
      // Serialization errors belong to this batch item, not the entire response.
      return JSON.parse(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: result ?? null,
          ...metadata,
        }),
      ) as unknown
    } catch (error) {
      requestOptions.signal.throwIfAborted()
      if (id === undefined) return undefined
      const cause =
        error instanceof BaseError
          ? error.walk(
              (error) =>
                error instanceof RpcRequestError ||
                error instanceof RpcResponse.BaseError,
            )
          : error
      const rpcError =
        cause instanceof RpcRequestError
          ? {
              code: cause.code,
              message: cause.details ?? 'RPC request failed',
              data: cause.data,
            }
          : cause instanceof RpcResponse.BaseError
            ? { code: cause.code, message: cause.message, data: cause.data }
            : { code: -32603, message: 'Internal error' }
      try {
        return JSON.parse(
          JSON.stringify({ jsonrpc: '2.0', id, error: rpcError }),
        ) as unknown
      } catch {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32603, message: 'Internal error' },
        }
      }
    }
  }

  if (Array.isArray(body.value) && body.value.length > 0) {
    if (body.value.length > 100)
      return Response.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32600,
          message: 'Batch exceeds the limit of 100 requests.',
        },
      })

    const batch = body.value
    const results = new Array<unknown>(batch.length)
    let index = 0
    await Promise.all(
      Array.from({ length: Math.min(10, batch.length) }, async () => {
        while (index < batch.length) {
          const current = index++
          results[current] = await handle(batch[current])
        }
      }),
    )
    const responses = results.filter((value) => value !== undefined)
    return responses.length
      ? Response.json(responses)
      : new Response(null, { status: 204 })
  }
  const response = await handle(body.value)
  return response === undefined
    ? new Response(null, { status: 204 })
    : Response.json(response)
}

/** Reads a request body, returning `undefined` once its declared or streamed size exceeds {@link maxBodySize}. */
async function readBody(request: Request) {
  if (Number(request.headers.get('content-length')) > maxBodySize) {
    await request.body?.cancel()
    return undefined
  }
  const chunks: Uint8Array<ArrayBuffer>[] = []
  if (!request.body) return chunks
  const reader = request.body.getReader()
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) return chunks
    size += value.byteLength
    if (size > maxBodySize) {
      await reader.cancel()
      return undefined
    }
    chunks.push(value)
  }
}
