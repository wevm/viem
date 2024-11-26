import { WebSocket } from 'isows'

import { assertType, describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { mine } from '../../actions/test/mine.js'
import { localhost } from '../../chains/index.js'
import { wait } from '../../utils/wait.js'

import { type WebSocketTransport, webSocket } from './webSocket.js'

const client = anvilMainnet.getClient()

test('default', () => {
  const transport = webSocket(anvilMainnet.rpcUrl.ws)

  assertType<WebSocketTransport>(transport)
  assertType<'webSocket'>(transport({}).config.type)

  expect(transport).toMatchInlineSnapshot('[Function]')
})

describe('config', () => {
  test('key', () => {
    const transport = webSocket(anvilMainnet.rpcUrl.ws, {
      key: 'mock',
    })

    expect(transport({})).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "webSocket",
        },
        "request": [Function],
        "value": {
          "getRpcClient": [Function],
          "getSocket": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })

  test('name', () => {
    const transport = webSocket(anvilMainnet.rpcUrl.ws, {
      name: 'Mock Transport',
    })

    expect(transport({})).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "webSocket",
          "name": "Mock Transport",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "webSocket",
        },
        "request": [Function],
        "value": {
          "getRpcClient": [Function],
          "getSocket": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })

  test('url', () => {
    const transport = webSocket('https://mockapi.com/rpc')

    expect(transport({})).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "webSocket",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "webSocket",
        },
        "request": [Function],
        "value": {
          "getRpcClient": [Function],
          "getSocket": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })
})

test('getSocket', async () => {
  const transport = webSocket(anvilMainnet.rpcUrl.ws)
  const socket = await transport({}).value?.getSocket()
  expect(socket).toBeDefined()
  expect(socket?.readyState).toBe(WebSocket.OPEN)
})

test('getRpcClient', async () => {
  const transport = webSocket(anvilMainnet.rpcUrl.ws)
  const socket = await transport({}).value?.getRpcClient()
  expect(socket).toBeDefined()
})

test('request', async () => {
  const transport = webSocket(undefined, {
    key: 'jsonRpc',
    name: 'JSON RPC',
  })

  expect(
    await transport({
      chain: {
        ...localhost,
        rpcUrls: {
          default: {
            http: [anvilMainnet.rpcUrl.ws],
            webSocket: [anvilMainnet.rpcUrl.ws],
          },
        },
      },
    }).config.request({
      method: 'eth_blockNumber',
    }),
  ).toBeDefined()
})

test('errors: rpc error', async () => {
  const transport = webSocket(anvilMainnet.rpcUrl.ws, {
    key: 'jsonRpc',
    name: 'JSON RPC',
  })({ chain: localhost })

  await expect(() =>
    transport.request({ method: 'eth_wagmi' }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    URL: http://localhost
    Request body: {"method":"eth_wagmi"}

    Details: data did not match any variant of untagged enum EthRpcCall
    Version: viem@x.y.z]
  `)
})

test('subscribe', async () => {
  const transport = webSocket(anvilMainnet.rpcUrl.ws, {
    key: 'jsonRpc',
    name: 'JSON RPC',
  })({})
  if (!transport.value) return

  const blocks: any[] = []
  const { subscriptionId, unsubscribe } = await transport.value.subscribe({
    params: ['newHeads'],
    onData: (data) => blocks.push(data),
  })

  // Make sure we are subscribed.
  expect(subscriptionId).toBeDefined()

  // Make sure we are receiving blocks.
  await mine(client, { blocks: 1 })
  await wait(200)
  expect(blocks.length).toBe(1)

  // Make sure we unsubscribe.
  const { result } = await unsubscribe()
  expect(result).toBeDefined()

  // Make sure we are no longer receiving blocks.
  await mine(client, { blocks: 1 })
  await wait(200)
  expect(blocks.length).toBe(1)
})

test('throws on socket closure', async () => {
  const transport = webSocket(anvilMainnet.rpcUrl.ws, {
    key: 'jsonRpc',
    name: 'JSON RPC',
  })({})
  if (!transport.value) return

  let error: Error | undefined
  const { subscriptionId } = await transport.value.subscribe({
    params: ['newHeads'],
    onData: () => {},
    onError: (error_) => {
      error = error_
    },
  })

  // Make sure we are subscribed.
  expect(subscriptionId).toBeDefined()

  await wait(100)
  const { socket } = await transport.value.getRpcClient()
  socket.close()
  await wait(100)

  expect(error).toMatchInlineSnapshot(`
    [SocketClosedError: The socket has been closed.

    URL: http://localhost

    Version: viem@x.y.z]
  `)
})

test('throws on bogus subscription', async () => {
  const transport = webSocket(anvilMainnet.rpcUrl.ws, {
    key: 'jsonRpc',
    name: 'JSON RPC',
  })

  const errors: any[] = []
  await expect(() =>
    transport({}).value?.subscribe({
      // @ts-expect-error - testing
      params: ['lol'],
      onData: () => null,
      onError: (err) => errors.push(err),
    }),
  ).rejects.toThrowError()
  expect(errors.length).toBeGreaterThan(0)
})

test('no url', () => {
  expect(() => webSocket()({})).toThrowErrorMatchingInlineSnapshot(`
    [UrlRequiredError: No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.

    Docs: https://viem.sh/docs/clients/intro
    Version: viem@x.y.z]
  `)
})
