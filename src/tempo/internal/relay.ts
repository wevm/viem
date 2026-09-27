import * as RpcResponse from 'ox/RpcResponse'
import { BaseError } from '../../errors/base.js'
import { RpcRequestError } from '../../errors/request.js'
import type * as Relay from '../Relay.js'

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
      return { value: (await request.json()) as unknown }
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
  if (body.error) return Response.json(body.error)

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
      const result = await handler(
        {
          method: value.method,
          ...('params' in value
            ? { params: value.params as readonly unknown[] }
            : {}),
        },
        requestOptions,
      )
      if (id === undefined) return undefined
      // Serialization errors belong to this batch item, not the entire response.
      return JSON.parse(
        JSON.stringify({ jsonrpc: '2.0', id, result: result ?? null }),
      ) as unknown
    } catch (error) {
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
    const responses = (await Promise.all(body.value.map(handle))).filter(
      (value) => value !== undefined,
    )
    return responses.length
      ? Response.json(responses)
      : new Response(null, { status: 204 })
  }
  const response = await handle(body.value)
  return response === undefined
    ? new Response(null, { status: 204 })
    : Response.json(response)
}
