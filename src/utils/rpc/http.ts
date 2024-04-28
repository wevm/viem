import {
  HttpRequestError,
  type HttpRequestErrorType as HttpRequestErrorType_,
  TimeoutError,
  type TimeoutErrorType,
} from '../../errors/request.js'
import type { ErrorType } from '../../errors/utils.js'
import type { RpcRequest, RpcResponse } from '../../types/rpc.js'
import {
  type WithTimeoutErrorType,
  withTimeout,
} from '../promise/withTimeout.js'
import { stringify } from '../stringify.js'
import { idCache } from './id.js'

export type HttpRpcClientOptions = {
  /** Request configuration to pass to `fetch`. */
  fetchOptions?: Omit<RequestInit, 'body'> | undefined
  /** A callback to handle the request. */
  onRequest?: ((request: Request) => Promise<void> | void) | undefined
  /** A callback to handle the response. */
  onResponse?: ((response: Response) => Promise<void> | void) | undefined
  /** The timeout (in ms) for the request. */
  timeout?: number | undefined
}

export type HttpRequestParameters<
  TBody extends RpcRequest | RpcRequest[] = RpcRequest,
> = {
  /** The RPC request body. */
  body: TBody
  /** Request configuration to pass to `fetch`. */
  fetchOptions?: HttpRpcClientOptions['fetchOptions'] | undefined
  /** A callback to handle the response. */
  onRequest?: ((request: Request) => Promise<void> | void) | undefined
  /** A callback to handle the response. */
  onResponse?: ((response: Response) => Promise<void> | void) | undefined
  /** The timeout (in ms) for the request. */
  timeout?: HttpRpcClientOptions['timeout'] | undefined
}

export type HttpRequestReturnType<
  TBody extends RpcRequest | RpcRequest[] = RpcRequest,
> = TBody extends RpcRequest[] ? RpcResponse[] : RpcResponse

export type HttpRequestErrorType =
  | HttpRequestErrorType_
  | TimeoutErrorType
  | WithTimeoutErrorType
  | ErrorType

export type HttpRpcClient = {
  request<TBody extends RpcRequest | RpcRequest[]>(
    params: HttpRequestParameters<TBody>,
  ): Promise<HttpRequestReturnType<TBody>>
}

export function getHttpRpcClient(
  url: string,
  options: HttpRpcClientOptions = {},
): HttpRpcClient {
  return {
    async request(params) {
      const {
        body,
        onRequest = options.onRequest,
        onResponse = options.onResponse,
        timeout = options.timeout ?? 10_000,
      } = params

      const fetchOptions = {
        ...(options.fetchOptions ?? {}),
        ...(params.fetchOptions ?? {}),
      }

      const { headers, method, signal: signal_ } = fetchOptions

      try {
        const response = await withTimeout(
          async ({ signal }) => {
            const init: RequestInit = {
              ...fetchOptions,
              body: Array.isArray(body)
                ? stringify(
                    body.map((body) => ({
                      jsonrpc: '2.0',
                      id: body.id ?? idCache.take(),
                      ...body,
                    })),
                  )
                : stringify({
                    jsonrpc: '2.0',
                    id: body.id ?? idCache.take(),
                    ...body,
                  }),
              headers: {
                ...headers,
                'Content-Type': 'application/json',
              },
              method: method || 'POST',
              signal: signal_ || (timeout > 0 ? signal : null),
            }
            const request = new Request(url, init)
            if (onRequest) await onRequest(request)
            const response = await fetch(url, init)
            return response
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
          data = JSON.parse(data || '{}')
        }

        if (!response.ok) {
          throw new HttpRequestError({
            body,
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url,
          })
        }

        return data
      } catch (err) {
        if (err instanceof HttpRequestError) throw err
        if (err instanceof TimeoutError) throw err
        throw new HttpRequestError({
          body,
          details: (err as Error).message,
          url,
        })
      }
    },
  }
}
