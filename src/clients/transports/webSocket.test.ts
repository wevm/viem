import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { WebSocket } from 'isows'
import { createClient } from 'viem'
import { watchBlocks } from 'viem/actions'
import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'
import { WebSocketServer } from 'ws'

import { anvilMainnet } from '~test/anvil.js'
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
          "methods": undefined,
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
          "methods": undefined,
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
          "methods": undefined,
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
    [MethodNotFoundRpcError: The method "eth_wagmi" does not exist / is not available.

    URL: http://localhost
    Request body: {"method":"eth_wagmi"}

    Details: Method not found
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

describe('unsubscribe', () => {
  // Replies to every request, except `eth_unsubscribe` on `/silent`.
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0 })
  const listening = once(server, 'listening')
  server.on('connection', (peer, request) => {
    peer.on('message', (message) => {
      const { id, method } = JSON.parse(message.toString())
      if (method === 'eth_unsubscribe' && request.url === '/silent') return
      const result = method === 'eth_subscribe' ? '0xsubscription' : true
      peer.send(JSON.stringify({ id, jsonrpc: '2.0', result }))
    })
  })

  beforeAll(() => listening)

  afterAll(async () => {
    for (const peer of server.clients) peer.terminate()
    await new Promise((resolve) => server.close(resolve))
  })

  function url(path: string) {
    const { port } = server.address() as AddressInfo
    return `ws://127.0.0.1:${port}${path}`
  }

  async function closeSocket(socket: WebSocket) {
    const closed = once(socket, 'close')
    socket.close()
    await closed
  }

  test('settles and releases the request', async () => {
    const results: Record<string, unknown> = {}
    for (const path of ['/open', '/closed', '/silent']) {
      const transport = webSocket(url(path), {
        keepAlive: false,
        reconnect: false,
        timeout: 200,
      })({ retryCount: 0 })
      const rpcClient = await transport.value!.getRpcClient()
      const { unsubscribe } = await transport.value!.subscribe({
        params: ['newHeads'],
        onData() {},
      })
      if (path === '/closed') await closeSocket(rpcClient.socket)

      const result = await unsubscribe().then(
        ({ result }) => ({ result }),
        (error) => ({ error: error.name }),
      )

      results[path] = { ...result, requests: rpcClient.requests.size }
      rpcClient.close()
    }

    expect(results).toMatchInlineSnapshot(`
      {
        "/closed": {
          "error": "WebSocketRequestError",
          "requests": 0,
        },
        "/open": {
          "requests": 0,
          "result": true,
        },
        "/silent": {
          "error": "TimeoutError",
          "requests": 0,
        },
      }
    `)
  })

  test('behavior: unwatch over a closed socket', async () => {
    const reasons: unknown[] = []
    const onUnhandledRejection = (reason: unknown) => reasons.push(reason)
    process.on('unhandledRejection', onUnhandledRejection)

    const transport = webSocket(url('/unwatch'), {
      keepAlive: false,
      reconnect: false,
    })
    const client = createClient({ transport })
    const rpcClient = await client.transport.getRpcClient()
    const unwatch = watchBlocks(client, { onBlock() {} })
    await wait(100)
    await closeSocket(rpcClient.socket)

    unwatch()
    await wait(100)
    process.off('unhandledRejection', onUnhandledRejection)

    expect(reasons).toMatchInlineSnapshot(`[]`)
  })
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
