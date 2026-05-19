import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, test, vi } from 'vp/test'
import { WebSocketServer } from 'ws'

import * as Chain from '../Chain.js'
import * as Transport from '../Transport.js'
import { webSocket } from './webSocket.js'

const chain = Chain.define({
  id: 1n,
  name: 'Test',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://example.com/rpc'],
      webSocket: ['wss://example.com/rpc'],
    },
  },
})

const cleanup: (() => Promise<void> | void)[] = []

afterEach(async () => {
  for (const dispose of cleanup.splice(0)) await dispose()
})

describe('webSocket', () => {
  test('behavior: resolves default chain URLs', () => {
    expect(() => webSocket()({ chain })).not.toThrow()
  })

  test('behavior: requires URLs', () => {
    expect(() => webSocket()({})).toThrow(Transport.UrlRequiredError)
  })

  test('behavior: sends requests', async () => {
    const server = await createWebSocketServer(
      (body) => ({
        id: body.id,
        jsonrpc: '2.0',
        result: body.method,
      }),
      {
        onMessage(socket) {
          socket.send('')
        },
      },
    )
    const transport = webSocket(server.url, { keepAlive: false })({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe('eth_blockNumber')
    ;(await transport.value?.getRpcClient())?.close()
  })

  test('behavior: throws websocket rpc errors', async () => {
    const server = await createWebSocketServer((body) => ({
      error: { code: -32000, message: 'nope' },
      id: body.id,
      jsonrpc: '2.0',
    }))
    const transport = webSocket(server.url, { keepAlive: false })({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toMatchObject({
      code: -32000,
    })
    ;(await transport.value?.getRpcClient())?.close()
  })

  test('behavior: subscribes and unsubscribes', async () => {
    const server = await createWebSocketServer((body, socket) => {
      if (body.method === 'eth_subscribe') {
        setTimeout(() => {
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: {},
            }),
          )
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: {
                result: '0x2',
                subscription: '0x1',
              },
            }),
          )
        }, 20)
        return {
          id: body.id,
          jsonrpc: '2.0',
          result: '0x1',
        }
      }
      return {
        id: body.id,
        jsonrpc: '2.0',
        result: true,
      }
    })
    const transport = webSocket(server.url, { keepAlive: false })({})
    const client = await transport.value!.getRpcClient()
    const onData = vi.fn()
    const subscription = await transport.value!.subscribe({
      onData,
      params: ['newHeads'],
    })
    await vi.waitFor(() => expect(onData).toHaveBeenCalledTimes(1))

    await expect(subscription.unsubscribe()).resolves.toMatchObject({
      result: true,
    })
    expect({
      data: onData.mock.calls,
      subscriptionId: subscription.subscriptionId,
    }).toMatchInlineSnapshot(`
      {
        "data": [
          [
            {
              "result": "0x2",
              "subscription": "0x1",
            },
          ],
        ],
        "subscriptionId": "0x1",
      }
    `)
    client.close()
  })

  test('behavior: rejects pending requests when sockets close', async () => {
    const server = await createWebSocketServer((_body, socket) => {
      socket.close()
    })
    const transport = webSocket(server.url, { keepAlive: false })({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('closed')
  })

  test('behavior: rejects pending subscriptions when sockets close', async () => {
    const server = await createWebSocketServer((_body, socket) => {
      socket.close()
    })
    const transport = webSocket(server.url, { keepAlive: false })({})
    const onError = vi.fn()

    await expect(() =>
      transport.value!.subscribe({
        onData() {},
        onError,
        params: ['newHeads'],
      }),
    ).rejects.toThrow('closed')
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('behavior: rejects websocket subscription errors', async () => {
    const server = await createWebSocketServer((body) => ({
      error: { code: -32000, message: 'nope' },
      id: body.id,
      jsonrpc: '2.0',
    }))
    const transport = webSocket(server.url, { keepAlive: false })({})
    const client = await transport.value!.getRpcClient()
    const onError = vi.fn()

    await expect(() =>
      transport.value!.subscribe({
        onData() {},
        onError,
        params: ['newHeads'],
      }),
    ).rejects.toMatchObject({
      code: -32000,
    })
    expect(onError).toHaveBeenCalledTimes(1)
    client.close()
  })

  test('behavior: rejects requests on closed sockets', async () => {
    const server = await createWebSocketServer((body) => ({
      id: body.id,
      jsonrpc: '2.0',
      result: body.method,
    }))
    const transport = webSocket(server.url, {
      keepAlive: { interval: 1 },
    })({})
    const client = await transport.value!.getRpcClient()
    await new Promise((resolve) => setTimeout(resolve, 5))
    client.close()

    expect(() =>
      client.request({
        body: { method: 'eth_blockNumber' },
        onResponse() {},
      }),
    ).toThrow('WebSocket request failed.')
  })
})

async function createWebSocketServer(
  handler: (body: any, socket: import('ws').WebSocket) => unknown,
  options: {
    onMessage?: ((socket: import('ws').WebSocket) => void) | undefined
  } = {},
) {
  const server = new WebSocketServer({ port: 0 })
  server.on('connection', (socket) => {
    socket.on('message', (message) => {
      options.onMessage?.(socket)
      const result = handler(JSON.parse(String(message)), socket)
      if (result) socket.send(JSON.stringify(result))
    })
  })
  await new Promise<void>((resolve) => server.once('listening', resolve))
  cleanup.push(
    () => new Promise<void>((resolve) => server.close(() => resolve())),
  )
  const address = server.address() as AddressInfo
  return { url: `ws://127.0.0.1:${address.port}` }
}
