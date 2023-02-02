import { expect, test } from 'vitest'
import { initialBlockNumber } from '../_test'
import { numberToHex } from '../utils'
import {
  HttpRequestError,
  RpcError,
  TimeoutError,
  WebSocketRequestError,
} from './rpc'

test('RpcError', () => {
  const err = new RpcError({
    body: { foo: 'bar' },
    error: { code: 420, message: 'Error' },
    url: 'https://lol.com',
  })
  expect(err).toMatchInlineSnapshot(`
    [RpcError: RPC Request failed.

    URL: https://lol.com
    Request body: {"foo":"bar"}

    Details: Error
    Version: viem@1.0.2
    Internal Error: {"code":420,"message":"Error"}]
  `)
})

test('HttpRequestError', () => {
  const err = new HttpRequestError({
    url: 'https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    body: {
      method: 'eth_getBlockByNumber',
      params: [numberToHex(initialBlockNumber), false],
    },
    status: 500,
    details: 'Some error',
  })
  expect(err).toMatchInlineSnapshot(`
    [HttpRequestError: HTTP request failed.

    Status: 500
    URL: https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC
    Request body: {"method":"eth_getBlockByNumber","params":["0xf86cc2",false]}

    Details: Some error
    Version: viem@1.0.2]
  `)
})

test('WebSocketRequestError', () => {
  const err = new WebSocketRequestError({
    url: 'ws://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    body: {
      method: 'eth_getBlockByNumber',
      params: [numberToHex(initialBlockNumber), false],
    },
    details: 'Some error',
  })
  expect(err).toMatchInlineSnapshot(`
    [WebSocketRequestError: WebSocket request failed.

    URL: ws://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC
    Request body: {"method":"eth_getBlockByNumber","params":["0xf86cc2",false]}

    Details: Some error
    Version: viem@1.0.2]
  `)
})

test('TimeoutError', () => {
  const err = new TimeoutError({
    url: 'https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    body: {
      method: 'eth_getBlockByNumber',
      params: [numberToHex(initialBlockNumber), false],
    },
  })
  expect(err).toMatchInlineSnapshot(`
    [TimeoutError: The request took too long to respond.

    URL: https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC
    Request body: {"method":"eth_getBlockByNumber","params":["0xf86cc2",false]}

    Details: The request timed out.
    Version: viem@1.0.2]
  `)
})
