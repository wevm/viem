import { expect, test } from 'vitest'

import { anvilMainnet } from '../../test/src/anvil.js'
import { numberToHex } from '../utils/encoding/toHex.js'

import {
  HttpRequestError,
  RpcRequestError,
  SocketClosedError,
  TimeoutError,
  WebSocketRequestError,
} from './request.js'

test('RpcRequestError', () => {
  const err = new RpcRequestError({
    body: { foo: 'bar' },
    error: { code: 420, message: 'Error' },
    url: 'https://lol.com',
  })
  expect(err).toMatchInlineSnapshot(`
    [RpcRequestError: RPC Request failed.

    URL: http://localhost
    Request body: {"foo":"bar"}

    Details: Error
    Version: viem@x.y.z]
  `)
})

test('HttpRequestError', () => {
  const err = new HttpRequestError({
    url: 'https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    body: {
      method: 'eth_getBlockByNumber',
      params: [numberToHex(anvilMainnet.forkBlockNumber), false],
    },
    status: 500,
    details: 'Some error',
  })
  expect(err).toMatchInlineSnapshot(`
    [HttpRequestError: HTTP request failed.

    Status: 500
    URL: http://localhost
    Request body: {"method":"eth_getBlockByNumber","params":["0x12f2974",false]}

    Details: Some error
    Version: viem@x.y.z]
  `)
})

test('WebSocketRequestError', () => {
  const err = new WebSocketRequestError({
    url: 'ws://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    body: {
      method: 'eth_getBlockByNumber',
      params: [numberToHex(anvilMainnet.forkBlockNumber), false],
    },
    details: 'Some error',
  })
  expect(err).toMatchInlineSnapshot(`
    [WebSocketRequestError: WebSocket request failed.

    URL: http://localhost
    Request body: {"method":"eth_getBlockByNumber","params":["0x12f2974",false]}

    Details: Some error
    Version: viem@x.y.z]
  `)
})

test('SocketClosedError', () => {
  const err = new SocketClosedError({
    url: 'ws://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
  })
  expect(err).toMatchInlineSnapshot(`
    [SocketClosedError: The socket has been closed.

    URL: http://localhost

    Version: viem@x.y.z]
  `)
})

test('TimeoutError', () => {
  const err = new TimeoutError({
    url: 'https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    body: {
      method: 'eth_getBlockByNumber',
      params: [numberToHex(anvilMainnet.forkBlockNumber), false],
    },
  })
  expect(err).toMatchInlineSnapshot(`
    [TimeoutError: The request took too long to respond.

    URL: http://localhost
    Request body: {"method":"eth_getBlockByNumber","params":["0x12f2974",false]}

    Details: The request timed out.
    Version: viem@x.y.z]
  `)
})
