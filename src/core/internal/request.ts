import { BaseError } from '../BaseError.js'
import { getUrl } from './errors.js'
import { stringify } from './stringify.js'

export type RequestBody = unknown

export type RpcErrorObject = {
  code: number
  data?: unknown | undefined
  message: string
}

export class HttpRequestError extends BaseError<Error | undefined> {
  override readonly name = 'HttpRequestError'

  readonly body?: RequestBody | undefined
  readonly headers?: Headers | undefined
  readonly status?: number | undefined
  readonly url: string

  constructor(options: HttpRequestError.Options) {
    const { body, cause, details, headers, status, url } = options
    super('HTTP request failed.', {
      cause,
      details,
      metaMessages: [
        status ? `Status: ${status}` : undefined,
        `URL: ${getUrl(url)}`,
        body ? `Request body: ${stringify(body)}` : undefined,
      ],
    })
    this.body = body
    this.headers = headers
    this.status = status
    this.url = url
  }
}

export declare namespace HttpRequestError {
  type Options = {
    body?: RequestBody | undefined
    cause?: Error | undefined
    details?: string | undefined
    headers?: Headers | undefined
    status?: number | undefined
    url: string
  }
}

export class WebSocketRequestError extends BaseError<Error | undefined> {
  override readonly name = 'WebSocketRequestError'

  readonly url: string

  constructor(options: WebSocketRequestError.Options) {
    const { body, cause, details, url } = options
    super('WebSocket request failed.', {
      cause,
      details,
      metaMessages: [
        `URL: ${getUrl(url)}`,
        body ? `Request body: ${stringify(body)}` : undefined,
      ],
    })
    this.url = url
  }
}

export declare namespace WebSocketRequestError {
  type Options = {
    body?: RequestBody | undefined
    cause?: Error | undefined
    details?: string | undefined
    url: string
  }
}

export class RpcRequestError extends BaseError<Error> {
  override readonly name = 'RpcRequestError'

  readonly code: number
  readonly data?: unknown | undefined
  readonly url: string

  constructor(options: RpcRequestError.Options) {
    const { body, error, url } = options
    super('RPC Request failed.', {
      cause: toCause(error),
      details: error.message,
      metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
    })
    this.code = error.code
    this.data = error.data
    this.url = url
  }
}

export declare namespace RpcRequestError {
  type Options = {
    body: RequestBody
    error: RpcErrorObject
    url: string
  }
}

export class SocketClosedError extends BaseError {
  override readonly name = 'SocketClosedError'

  readonly url?: string | undefined

  constructor(options: SocketClosedError.Options = {}) {
    const { url } = options
    super('The socket has been closed.', {
      metaMessages: [url ? `URL: ${getUrl(url)}` : undefined],
    })
    this.url = url
  }
}

export declare namespace SocketClosedError {
  type Options = {
    url?: string | undefined
  }
}

export class TimeoutError extends BaseError {
  override readonly name = 'TimeoutError'

  readonly url: string

  constructor(options: TimeoutError.Options) {
    const { body, url } = options
    super('The request took too long to respond.', {
      details: 'The request timed out.',
      metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
    })
    this.url = url
  }
}

export declare namespace TimeoutError {
  type Options = {
    body: RequestBody
    url: string
  }
}

function toCause(error: RpcErrorObject) {
  return Object.assign(new Error(error.message), {
    code: error.code,
    data: error.data,
  })
}
