import { RpcResponse } from 'ox'
import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as Ws from '~test/ws.js'
import { Actions, Chain, Transport, webSocket } from 'viem'
import { RpcClient } from 'viem/utils'

const url = anvil.mainnet.rpcUrl.ws
const client = anvil.getClient(anvil.mainnet)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('webSocket', () => {
  test('uses the default transport identity', () => {
    const transport = webSocket(url)
    expect(transport.key).toBe('webSocket')
    expect(transport.name).toBe('WebSocket JSON-RPC')
    expect(transport.type).toBe('webSocket')
  })

  test('accepts a custom key and name', () => {
    const transport = webSocket(url, { key: 'ws', name: 'My WS' })
    expect(transport.key).toBe('ws')
    expect(transport.name).toBe('My WS')
  })

  test('transport options take precedence over setup options', () => {
    const instance = webSocket(url, {
      retryCount: 7,
      retryDelay: 99,
      timeout: 5_000,
    }).setup({ retryCount: 1, timeout: 1_000 })
    expect(instance.timeout).toBe(5_000)
    expect(instance.retryCount).toBe(7)
    expect(instance.retryDelay).toBe(99)
  })

  test('falls back to setup options when transport options are absent', () => {
    const instance = webSocket(url).setup({
      retryCount: 2,
      timeout: 1_234,
    })
    expect(instance.timeout).toBe(1_234)
    expect(instance.retryCount).toBe(2)
  })

  test('honors the method filter', async () => {
    const transport = webSocket(url, {
      methods: { exclude: ['eth_accounts'] },
    }).setup()
    await expect(
      transport.request({ method: 'eth_accounts' }),
    ).rejects.toBeInstanceOf(RpcResponse.MethodNotSupportedError)
  })

  test('request returns the result', async () => {
    const transport = webSocket(url).setup()
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
    ;(await transport.getRpcClient()).close()
  })

  test('request forwards method and params', async () => {
    const transport = webSocket(url).setup()
    // Requesting block `0x0` proves `params` reached the node (it returns the
    // genesis block, not the latest one).
    const block = (await transport.request({
      method: 'eth_getBlockByNumber',
      params: ['0x0', false],
    })) as { number: string }
    expect(block.number).toBe('0x0')
    ;(await transport.getRpcClient()).close()
  })

  test('throws UrlRequiredError without a URL or chain', () => {
    expect(() => webSocket().setup()).toThrowError(Transport.UrlRequiredError)
  })

  test('throws UrlRequiredError when the chain has no RPC URLs', () => {
    const chain = Chain.from({ id: 1 })
    expect(() => webSocket().setup({ chain })).toThrowError(
      Transport.UrlRequiredError,
    )
  })

  test('falls back to the chain default RPC URL', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [], webSocket: [url] } },
    })
    const transport = webSocket().setup({ chain })
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
    ;(await transport.getRpcClient()).close()
  })

  test('maps a JSON-RPC error via ox', async () => {
    const transport = webSocket(url, { retryCount: 0 }).setup()
    await expect(
      transport.request({ method: 'eth_thisDoesNotExist' }),
    ).rejects.toBeInstanceOf(RpcResponse.BaseError)
    ;(await transport.getRpcClient()).close()
  })

  test('getRpcClient returns the same cached client', async () => {
    const transport = webSocket(url).setup()
    const a = await transport.getRpcClient()
    const b = await transport.getRpcClient()
    expect(a).toBe(b)
    expect(a.socket).toBeDefined()
    a.close()
  })

  test('ignores empty frames and resolves valid responses', async () => {
    const server = await Ws.createServer((connection, message) => {
      const request = JSON.parse(message)
      // Whitespace-only frame is ignored, then the real response resolves.
      connection.send('   ')
      connection.send(
        JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
      )
    })
    try {
      const transport = webSocket(server.url, {
        keepAlive: false,
      }).setup()
      expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('surfaces malformed messages as errors', async () => {
    const server = await Ws.createServer((connection) => {
      // Respond with a non-JSON text frame.
      connection.send('not json')
    })
    try {
      const transport = webSocket(server.url, {
        keepAlive: false,
        retryCount: 0,
        timeout: 50,
      }).setup()
      await expect(
        transport.request({ method: 'eth_chainId' }),
      ).rejects.toBeInstanceOf(RpcClient.TimeoutError)
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('request honors an explicit body id', async () => {
    const transport = webSocket(url).setup()
    const client = await transport.getRpcClient()
    const response = await client.request({
      body: { id: 99, method: 'eth_chainId' },
    })
    expect(response.id).toBe(99)
    expect(response.result).toBe('0x1')
    client.close()
  })

  test('request sends a batch body and preserves order', async () => {
    const transport = webSocket(url).setup()
    const client = await transport.getRpcClient()
    const [chainId, blockNumber] = await client.request({
      body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
    })
    expect(chainId.result).toBe('0x1')
    expect(typeof blockNumber.result).toBe('string')
    client.close()
  })

  test('subscribe receives data and unsubscribes', async () => {
    const transport = webSocket(url, { keepAlive: false }).setup()
    const data: unknown[] = []
    const sub = await transport.subscribe({
      params: ['newHeads'],
    })
    sub.onData((d) => data.push(d))
    expect(sub.subscriptionId).toMatch(/^0x/)
    // anvil only emits `newHeads` when a block is mined.
    await Actions.block.mine(client, { blocks: 1 })
    await wait(500)
    expect(data.length).toBeGreaterThan(0)
    expect((data[0] as { subscription: string }).subscription).toBe(
      sub.subscriptionId,
    )
    const result = await sub.unsubscribe()
    expect(result.result).toBe(true)
    ;(await transport.getRpcClient()).close()
  })

  test('subscribe rejects on a JSON-RPC error', async () => {
    const server = await Ws.createServer((connection, message) => {
      const request = JSON.parse(message)
      if (request.method === 'eth_subscribe')
        connection.send(
          JSON.stringify({
            id: request.id,
            jsonrpc: '2.0',
            error: { code: -32602, message: 'invalid params' },
          }),
        )
    })

    try {
      const transport = webSocket(server.url).setup()
      await expect(
        transport.subscribe({
          params: ['newHeads'],
        }),
      ).rejects.toBeInstanceOf(RpcResponse.BaseError)
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('resubscribes active subscriptions after a reconnect', async () => {
    let subscribeCount = 0
    const server = await Ws.createServer((connection, message) => {
      const request = JSON.parse(message)
      if (request.method === 'eth_subscribe') {
        subscribeCount++
        connection.send(
          JSON.stringify({
            id: request.id,
            jsonrpc: '2.0',
            result: `0xsub${subscribeCount}`,
          }),
        )
      }
    })

    try {
      const transport = webSocket(server.url, {
        keepAlive: false,
        reconnect: { minReconnectionDelay: 10, maxReconnectionDelay: 10 },
      }).setup()
      await transport.subscribe({ params: ['newHeads'] })
      expect(subscribeCount).toBe(1)

      server.dropAll()
      await wait(500)
      expect(subscribeCount).toBe(2)
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('reconnect: false clears subscriptions on close', async () => {
    const server = await Ws.createServer((connection, message) => {
      const request = JSON.parse(message)
      if (request.method === 'eth_subscribe')
        connection.send(
          JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
        )
    })

    try {
      const transport = webSocket(server.url, {
        keepAlive: false,
        reconnect: false,
      }).setup()
      await transport.subscribe({ params: ['newHeads'] })
      const client = await transport.getRpcClient()
      expect(client.subscriptions.size).toBe(1)

      server.dropAll()
      await wait(100)
      expect(client.subscriptions.size).toBe(0)
      client.close()
    } finally {
      await server.close()
    }
  })

  test('sends keep-alive messages', async () => {
    let pings = 0
    const server = await Ws.createServer((connection, message) => {
      const request = JSON.parse(message)
      if (request.method === 'net_version') {
        pings++
        // Reply with `id: null` to exercise the unknown-id response path.
        connection.send(
          JSON.stringify({ id: null, jsonrpc: '2.0', result: '1' }),
        )
      }
    })

    try {
      const transport = webSocket(server.url, {
        keepAlive: { interval: 30 },
      }).setup()
      await transport.getRpcClient()
      await wait(120)
      expect(pings).toBeGreaterThanOrEqual(2)
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('keepAlive: false does not send keep-alive messages', async () => {
    let pings = 0
    const server = await Ws.createServer((_connection, message) => {
      if (JSON.parse(message).method === 'net_version') pings++
    })

    try {
      const transport = webSocket(server.url, {
        keepAlive: false,
      }).setup()
      await transport.getRpcClient()
      await wait(80)
      expect(pings).toBe(0)
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('times out when the server does not respond', async () => {
    const server = await Ws.createServer(() => {})
    try {
      const transport = webSocket(server.url, {
        keepAlive: false,
        retryCount: 0,
        timeout: 50,
      }).setup()
      await expect(
        transport.request({ method: 'eth_chainId' }),
      ).rejects.toBeInstanceOf(RpcClient.TimeoutError)
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('rejects in-flight requests when the socket closes', async () => {
    const server = await Ws.createServer((connection) => {
      // Drop the connection instead of responding.
      connection.close()
    })
    try {
      const transport = webSocket(server.url, {
        keepAlive: false,
        reconnect: false,
        retryCount: 0,
      }).setup()
      const client = await transport.getRpcClient()
      await expect(
        client.request({ body: { method: 'eth_chainId' } }),
      ).rejects.toBeInstanceOf(RpcClient.SocketClosedError)
      client.close()
    } finally {
      await server.close()
    }
  })

  test('replays the last socket error to subsequent requests', async () => {
    // Connection-refused endpoint: the socket errors immediately.
    const transport = webSocket('ws://127.0.0.1:1', {
      keepAlive: false,
      reconnect: false,
      retryCount: 0,
      timeout: 1_000,
    }).setup()
    const client = await transport.getRpcClient()

    await expect(
      client.request({ body: { method: 'eth_chainId' } }),
    ).rejects.toBeDefined()

    // A second request observes the retained error synchronously.
    await expect(
      client.request({ body: { method: 'eth_chainId' } }),
    ).rejects.toBeDefined()

    client.close()
  })
})
