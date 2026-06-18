import type * as RpcRequest_ox from 'ox/RpcRequest'
import type * as RpcResponse from 'ox/RpcResponse'
import type * as RpcSchema from 'ox/RpcSchema'

import * as Errors from './Errors.js'
import * as errors from './internal/errors.js'
import * as promise from './internal/promise.js'
import { stringify } from './internal/stringify.js'
import type { MaybePromise } from './internal/types.js'

/** A JSON-RPC request body (id/jsonrpc filled in by the client). */
export type RpcRequest = Omit<
  RpcRequest_ox.RpcRequest,
  'id' | 'jsonrpc' | '_returnType'
> & {
  id?: number | undefined
  jsonrpc?: '2.0' | undefined
}

/**
 * A request body's typed response: a single body maps to one response, a batch
 * maps element-wise to a tuple. Results are typed from each method against the
 * {@link ox#RpcSchema}, falling back to `unknown`.
 */
type ResponsesOf<body extends RpcRequest | readonly RpcRequest[]> =
  body extends readonly RpcRequest[]
    ? {
        -readonly [index in keyof body]: RpcResponse.RpcResponse<
          RpcSchema.ExtractReturnType<
            RpcSchema.Default,
            body[index] extends RpcRequest ? body[index]['method'] : string
          >
        >
      }
    : body extends RpcRequest
      ? RpcResponse.RpcResponse<
          RpcSchema.ExtractReturnType<RpcSchema.Default, body['method']>
        >
      : RpcResponse.RpcResponse

/**
 * A JSON-RPC client: executes a request body (single or batch) over an
 * endpoint. Results are typed from each method against the
 * {@link ox#RpcSchema} (mirrors ox `RpcTransport`).
 */
export type RpcClient = {
  request<const body extends RpcRequest | readonly RpcRequest[]>(params: {
    body: body
    fetchOptions?: Omit<RequestInit, 'body'> | undefined
  }): Promise<ResponsesOf<body>>
}

/** Creates an HTTP JSON-RPC client (single + batch bodies). */
export function http(
  url_: string,
  options: http.Options = {},
): http.ReturnType {
  const { url, headers: headers_url } = parseUrl(url_)

  return {
    async request(params) {
      const { fetchOptions: fetchOptions_ } = params
      const body = params.body as RpcRequest | RpcRequest[]
      const {
        fetchFn = options.fetchFn ?? fetch,
        onRequest = options.onRequest,
        onResponse = options.onResponse,
        timeout = options.timeout ?? 10_000,
      } = options

      const fetchOptions = { ...options.fetchOptions, ...fetchOptions_ }
      const { headers, method, signal: signal_ } = fetchOptions

      try {
        const response = await promise.withTimeout(
          async ({ signal }) => {
            const init: RequestInit = {
              ...fetchOptions,
              body: Array.isArray(body)
                ? stringify(
                    body.map((b) => ({
                      jsonrpc: '2.0',
                      id: b.id ?? id++,
                      ...b,
                    })),
                  )
                : stringify({ jsonrpc: '2.0', id: body.id ?? id++, ...body }),
              headers: {
                ...headers_url,
                'Content-Type': 'application/json',
                ...headers,
              },
              method: method || 'POST',
              signal: signal_ || (timeout > 0 ? signal : null),
            }
            const request = new Request(url, init)
            const overrides = (await onRequest?.(request, init)) ?? {
              ...init,
              url,
            }
            return fetchFn(overrides.url ?? url, overrides)
          },
          {
            errorInstance: new TimeoutError({ body, url }),
            timeout,
            signal: true,
          },
        )

        if (onResponse) await onResponse(response)

        let data: any
        if (
          response.headers.get('Content-Type')?.startsWith('application/json')
        )
          data = await response.json()
        else {
          data = await response.text()
          try {
            data = JSON.parse(data || '{}')
          } catch (err) {
            if (response.ok) throw err
            data = { error: data }
          }
        }

        if (!response.ok) {
          // A valid JSON-RPC error body flows through normal error handling.
          if (
            typeof data.error?.code === 'number' &&
            typeof data.error?.message === 'string'
          )
            return data

          throw new HttpError({
            body,
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url,
          })
        }

        return data
      } catch (err) {
        if (signal_?.aborted) throw errors.getAbortError(signal_)
        if (err instanceof HttpError) throw err
        if (err instanceof TimeoutError) throw err
        throw new HttpError({ body, cause: err as Error, url })
      }
    },
  }
}

export declare namespace http {
  type Options = {
    /** Override for the `fetch` function. */
    fetchFn?: typeof fetch | undefined
    /** Request configuration passed to `fetch`. */
    fetchOptions?: Omit<RequestInit, 'body'> | undefined
    /** Callback invoked before the request is sent. */
    onRequest?:
      | ((
          request: Request,
          init: RequestInit,
        ) => MaybePromise<void | (RequestInit & { url?: string | undefined })>)
      | undefined
    /** Callback invoked with the raw response. */
    onResponse?: ((response: Response) => MaybePromise<void>) | undefined
    /** Timeout (in ms) for the request. @default 10_000 */
    timeout?: number | undefined
  }

  type ReturnType = RpcClient
}

/** Monotonic JSON-RPC request id source. @internal */
let id = 0

/** Parses Basic-auth credentials out of a URL into an `Authorization` header. */
function parseUrl(url_: string): {
  url: string
  headers?: Record<string, string> | undefined
} {
  try {
    const url = new URL(url_)
    if (url.username) {
      const credentials = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`
      url.username = ''
      url.password = ''
      return {
        url: url.toString(),
        headers: { Authorization: `Basic ${btoa(credentials)}` },
      }
    }
    return { url: url.toString() }
  } catch {
    return { url: url_ }
  }
}

/** Thrown when an HTTP request fails. */
export class HttpError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'RpcClient.HttpError'

  body?: { [x: string]: unknown } | { [y: string]: unknown }[] | undefined
  headers?: Headers | undefined
  status?: number | undefined
  url: string

  constructor({
    body,
    cause,
    details,
    headers,
    status,
    url,
  }: {
    body?: { [x: string]: unknown } | { [y: string]: unknown }[] | undefined
    cause?: Error | undefined
    details?: string | undefined
    headers?: Headers | undefined
    status?: number | undefined
    url: string
  }) {
    super('HTTP request failed.', {
      cause,
      details,
      metaMessages: [
        status && `Status: ${status}`,
        `URL: ${url}`,
        body && `Request body: ${stringify(body)}`,
      ].filter(Boolean) as string[],
    })
    this.body = body
    this.headers = headers
    this.status = status
    this.url = url
  }
}

/** Thrown when a request takes longer than the configured timeout. */
export class TimeoutError extends Errors.BaseError {
  override readonly name = 'RpcClient.TimeoutError'

  url: string

  constructor({
    body,
    url,
  }: {
    body: { [x: string]: unknown } | { [y: string]: unknown }[]
    url: string
  }) {
    super('The request took too long to respond.', {
      details: 'The request timed out.',
      metaMessages: [`URL: ${url}`, `Request body: ${stringify(body)}`],
    })
    this.url = url
  }
}
