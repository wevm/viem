import { BaseError } from './base'

export class HttpRequestError extends BaseError {
  name = 'HttpRequestError'
  status

  constructor({
    body,
    details,
    status,
    url,
  }: {
    body: { [key: string]: unknown }
    details: string
    status: number
    url: string
  }) {
    super(
      [
        'HTTP request failed.',
        '',
        `Status: ${status}`,
        `URL: ${url}`,
        `Request body: ${JSON.stringify(body)}`,
      ].join('\n'),
      {
        details,
      },
    )
    this.status = status
  }
}

export class WebSocketRequestError extends BaseError {
  name = 'WebSocketRequestError'

  constructor({
    body,
    details,
    url,
  }: {
    body: { [key: string]: unknown }
    details: string
    url: string
  }) {
    super(
      [
        'WebSocket request failed.',
        '',
        `URL: ${url}`,
        `Request body: ${JSON.stringify(body)}`,
      ].join('\n'),
      {
        details,
      },
    )
  }
}

export class RpcError extends BaseError {
  code: number

  name = 'RpcError'

  constructor({
    body,
    error,
    url,
  }: {
    body: { [key: string]: unknown }
    error: { code: number; message: string }
    url: string
  }) {
    super(
      [
        'RPC Request failed.',
        '',
        `URL: ${url}`,
        `Request body: ${JSON.stringify(body)}`,
      ].join('\n'),
      {
        cause: error as any,
        details: error.message,
      },
    )
    this.code = error.code
  }
}

export class TimeoutError extends BaseError {
  name = 'TimeoutError'

  constructor({
    body,
    url,
  }: {
    body: { [key: string]: unknown }
    url: string
  }) {
    super(
      [
        'The request took too long to respond.',
        '',
        `URL: ${url}`,
        `Request body: ${JSON.stringify(body)}`,
      ].join('\n'),
      {
        details: 'The request timed out.',
      },
    )
  }
}
