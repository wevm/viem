import { describe, expect, test } from 'vp/test'

import {
  HttpRequestError,
  RpcRequestError,
  SocketClosedError,
  TimeoutError,
  WebSocketRequestError,
} from './request.js'

const body = {
  method: 'eth_getBlockByNumber',
  params: ['0x153b747', false],
}

describe('HttpRequestError', () => {
  test('behavior: formats request metadata', () => {
    const error = new HttpRequestError({
      body,
      details: 'Some error',
      status: 500,
      url: 'https://user:password@example.com/rpc',
    })

    expect({
      body: error.body,
      message: error.message,
      name: error.name,
      status: error.status,
      url: error.url,
    }).toMatchInlineSnapshot(`
      {
        "body": {
          "method": "eth_getBlockByNumber",
          "params": [
            "0x153b747",
            false,
          ],
        },
        "message": "HTTP request failed.

      Status: 500
      URL: https://example.com/rpc
      Request body: {"method":"eth_getBlockByNumber","params":["0x153b747",false]}

      Details: Some error
      Version: viem@2.49.3",
        "name": "HttpRequestError",
        "status": 500,
        "url": "https://user:password@example.com/rpc",
      }
    `)
  })
})

describe('WebSocketRequestError', () => {
  test('behavior: formats websocket request metadata', () => {
    const error = new WebSocketRequestError({
      body,
      details: 'Some error',
      url: 'wss://user:password@example.com/rpc',
    })

    expect({
      message: error.message,
      name: error.name,
      url: error.url,
    }).toMatchInlineSnapshot(`
      {
        "message": "WebSocket request failed.

      URL: wss://example.com/rpc
      Request body: {"method":"eth_getBlockByNumber","params":["0x153b747",false]}

      Details: Some error
      Version: viem@2.49.3",
        "name": "WebSocketRequestError",
        "url": "wss://user:password@example.com/rpc",
      }
    `)
  })
})

describe('RpcRequestError', () => {
  test('behavior: formats rpc response errors', () => {
    const error = new RpcRequestError({
      body,
      error: { code: 420, data: { reason: 'nope' }, message: 'Error' },
      url: 'https://user:password@example.com/rpc',
    })

    expect({
      code: error.code,
      data: error.data,
      message: error.message,
      name: error.name,
      url: error.url,
    }).toMatchInlineSnapshot(`
      {
        "code": 420,
        "data": {
          "reason": "nope",
        },
        "message": "RPC Request failed.

      URL: https://example.com/rpc
      Request body: {"method":"eth_getBlockByNumber","params":["0x153b747",false]}

      Details: Error
      Version: viem@2.49.3",
        "name": "RpcRequestError",
        "url": "https://user:password@example.com/rpc",
      }
    `)
  })
})

describe('SocketClosedError', () => {
  test('behavior: formats optional socket url', () => {
    const error = new SocketClosedError({
      url: 'wss://user:password@example.com/rpc',
    })

    expect({
      message: error.message,
      name: error.name,
      url: error.url,
    }).toMatchInlineSnapshot(`
      {
        "message": "The socket has been closed.

      URL: wss://example.com/rpc

      Version: viem@2.49.3",
        "name": "SocketClosedError",
        "url": "wss://user:password@example.com/rpc",
      }
    `)
  })
})

describe('TimeoutError', () => {
  test('behavior: formats timeout metadata', () => {
    const error = new TimeoutError({
      body,
      url: 'https://user:password@example.com/rpc',
    })

    expect({
      message: error.message,
      name: error.name,
      url: error.url,
    }).toMatchInlineSnapshot(`
      {
        "message": "The request took too long to respond.

      URL: https://example.com/rpc
      Request body: {"method":"eth_getBlockByNumber","params":["0x153b747",false]}

      Details: The request timed out.
      Version: viem@2.49.3",
        "name": "TimeoutError",
        "url": "https://user:password@example.com/rpc",
      }
    `)
  })
})
