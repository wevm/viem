import { RpcResponse } from 'ox'
import { describe, expect, test } from 'vitest'

import * as Ipc from '~test/ipc.js'
import { RpcClient } from 'viem/utils'
import * as ipc from './ipc.js'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A path that no IPC server listens on (used for connection-error tests). */
const deadPath = `/tmp/viem-test-dead-${Date.now()}-${Math.random()
  .toString(36)
  .slice(2)}.ipc`

/** Replies to a JSON-RPC request frame on an IPC socket like a real node. */
function reply(socket: { write: (data: string) => void }, request: any) {
  const respond = (result: unknown) =>
    socket.write(JSON.stringify({ id: request.id, jsonrpc: '2.0', result }))
  switch (request.method) {
    case 'eth_chainId':
      return respond('0x1')
    case 'eth_blockNumber':
      return respond('0x2a')
    // Echo the requested block number back to prove `params` were forwarded.
    case 'eth_getBlockByNumber':
      return respond({ number: request.params[0] })
    case 'eth_thisDoesNotExist':
      return socket.write(
        JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          error: { code: -32601, message: 'method not found' },
        }),
      )
  }
}

describe('extractMessages', () => {
  test('extracts concatenated and partial JSON messages', () => {
    const [messages, remaining] = ipc.extractMessages(
      Buffer.from('{"a":1}{"b":2}{"c"'),
    )
    expect(messages.map((m) => m.toString())).toEqual(['{"a":1}', '{"b":2}'])
    expect(remaining.toString()).toBe('{"c"')
  })

  test('ignores leading and trailing whitespace between frames', () => {
    const [messages, remaining] = ipc.extractMessages(
      Buffer.from(' {"a":1} \n {"b":2} '),
    )
    expect(messages.map((m) => m.toString())).toEqual(['{"a":1}', '{"b":2}'])
    expect(remaining.toString().trim()).toBe('')
  })

  test('returns the whole buffer as remaining when no frame is complete', () => {
    const [messages, remaining] = ipc.extractMessages(Buffer.from('{"a":'))
    expect(messages).toEqual([])
    expect(remaining.toString()).toBe('{"a":')
  })
})

describe('ipc', () => {
  test('uses the default transport identity', () => {
    const transport = ipc.ipc(deadPath)
    expect(transport.key).toBe('ipc')
    expect(transport.name).toBe('IPC JSON-RPC')
    expect(transport.type).toBe('ipc')
  })

  test('accepts a custom key and name', () => {
    const transport = ipc.ipc(deadPath, { key: 'my-ipc', name: 'My IPC' })
    expect(transport.key).toBe('my-ipc')
    expect(transport.name).toBe('My IPC')
  })

  test('transport options take precedence over setup options', () => {
    const instance = ipc
      .ipc(deadPath, {
        retryCount: 7,
        retryDelay: 99,
        timeout: 5_000,
      })
      .setup({ retryCount: 1, timeout: 1_000 })
    expect(instance.timeout).toBe(5_000)
    expect(instance.retryCount).toBe(7)
    expect(instance.retryDelay).toBe(99)
  })

  test('falls back to setup options when transport options are absent', () => {
    const instance = ipc.ipc(deadPath).setup({ retryCount: 2, timeout: 1_234 })
    expect(instance.timeout).toBe(1_234)
    expect(instance.retryCount).toBe(2)
  })

  test('honors the method filter', async () => {
    const transport = ipc
      .ipc(deadPath, {
        methods: { exclude: ['eth_accounts'] },
      })
      .setup({})
    await expect(
      transport.request({ method: 'eth_accounts' }),
    ).rejects.toBeInstanceOf(RpcResponse.MethodNotSupportedError)
  })

  test('request returns the result', async () => {
    const server = await Ipc.createServer((socket, message) =>
      reply(socket, JSON.parse(message)),
    )
    try {
      const transport = ipc.ipc(server.path).setup({})
      expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('request forwards method and params', async () => {
    const server = await Ipc.createServer((socket, message) =>
      reply(socket, JSON.parse(message)),
    )
    try {
      const transport = ipc.ipc(server.path).setup({})
      // Requesting block `0x0` proves `params` reached the server.
      const block = (await transport.request({
        method: 'eth_getBlockByNumber',
        params: ['0x0', false],
      })) as { number: string }
      expect(block.number).toBe('0x0')
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('maps a JSON-RPC error via ox', async () => {
    const server = await Ipc.createServer((socket, message) =>
      reply(socket, JSON.parse(message)),
    )
    try {
      const transport = ipc.ipc(server.path, { retryCount: 0 }).setup({})
      await expect(
        transport.request({ method: 'eth_thisDoesNotExist' }),
      ).rejects.toBeInstanceOf(RpcResponse.BaseError)
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('request honors an explicit body id', async () => {
    const server = await Ipc.createServer((socket, message) =>
      reply(socket, JSON.parse(message)),
    )
    try {
      const transport = ipc.ipc(server.path).setup({})
      const client = await transport.getRpcClient()
      const response = await client.request({
        body: { id: 99, method: 'eth_chainId' },
      })
      expect(response.id).toBe(99)
      expect(response.result).toBe('0x1')
      client.close()
    } finally {
      await server.close()
    }
  })

  test('request sends a batch body and preserves order', async () => {
    const server = await Ipc.createServer((socket, message) =>
      reply(socket, JSON.parse(message)),
    )
    try {
      const transport = ipc.ipc(server.path).setup({})
      const client = await transport.getRpcClient()
      const [chainId, blockNumber] = await client.request({
        body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
      })
      expect(chainId.result).toBe('0x1')
      expect(blockNumber.result).toBe('0x2a')
      client.close()
    } finally {
      await server.close()
    }
  })

  test('replays the last socket error to subsequent requests', async () => {
    // No server listens on `deadPath`, so the socket errors immediately.
    const transport = ipc
      .ipc(deadPath, {
        keepAlive: false,
        reconnect: false,
        retryCount: 0,
        timeout: 1_000,
      })
      .setup({})
    const client = await transport.getRpcClient()
    // Let the connection attempt fail and retain the error.
    await wait(50)

    await expect(
      client.request({ body: { method: 'eth_chainId' } }),
    ).rejects.toBeDefined()

    // A second request observes the retained error immediately.
    await expect(
      client.request({ body: { method: 'eth_chainId' } }),
    ).rejects.toBeDefined()

    client.close()
  })

  test('getRpcClient returns the same cached client', async () => {
    const server = await Ipc.createServer((socket, message) =>
      reply(socket, JSON.parse(message)),
    )
    try {
      const transport = ipc.ipc(server.path).setup({})
      const a = await transport.getRpcClient()
      const b = await transport.getRpcClient()
      expect(a).toBe(b)
      await wait(50)
      expect(a.socket.socket).toBeDefined()
      a.close()
    } finally {
      await server.close()
    }
  })

  test('exposes the connection ready state', async () => {
    const server = await Ipc.createServer((socket, message) =>
      reply(socket, JSON.parse(message)),
    )
    try {
      const transport = ipc.ipc(server.path, { keepAlive: false }).setup({})
      const client = await transport.getRpcClient()
      await wait(50)
      expect(client.socket.readyState).toBe(1)
      client.close()
      expect(client.socket.readyState).toBe(3)
    } finally {
      await server.close()
    }
  })

  test('reassembles a JSON message split across socket writes', async () => {
    const server = await Ipc.createServer((socket, message) => {
      const request = JSON.parse(message)
      if (request.method !== 'eth_chainId') return
      const full = JSON.stringify({
        id: request.id,
        jsonrpc: '2.0',
        result: '0x1',
      })
      const mid = Math.floor(full.length / 2)
      // Send the response as two separate frames to force buffer reassembly.
      socket.write(full.slice(0, mid))
      setTimeout(() => socket.write(full.slice(mid)), 20)
    })
    try {
      const transport = ipc.ipc(server.path, { keepAlive: false }).setup({})
      expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  test('routes multiple messages delivered in a single frame', async () => {
    const server = await Ipc.createServer((socket, message) => {
      const request = JSON.parse(message)
      if (request.method === 'eth_subscribe')
        // Ack and first notification concatenated into one frame.
        socket.write(
          JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }) +
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: { subscription: '0xsub', result: { number: '0x1' } },
            }),
        )
    })
    try {
      const transport = ipc.ipc(server.path, { keepAlive: false }).setup({})
      const data: unknown[] = []
      const sub = await transport.subscribe({ params: ['newHeads'] })
      sub.onData((d) => data.push(d))
      await wait(50)
      expect(data).toEqual([
        { subscription: '0xsub', result: { number: '0x1' } },
      ])
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  describe('subscribe', () => {
    test('receives data and unsubscribes', async () => {
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          socket.write(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
          socket.write(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: { subscription: '0xsub', result: { number: '0x1' } },
            }),
          )
        }
        if (request.method === 'eth_unsubscribe')
          socket.write(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: true }),
          )
      })
      try {
        const transport = ipc.ipc(server.path).setup({})
        const data: unknown[] = []
        const sub = await transport.subscribe({ params: ['newHeads'] })
        sub.onData((d) => data.push(d))
        expect(sub.subscriptionId).toBe('0xsub')
        await wait(100)
        expect(data).toEqual([
          { subscription: '0xsub', result: { number: '0x1' } },
        ])
        const result = await sub.unsubscribe()
        expect(result.result).toBe(true)
        ;(await transport.getRpcClient()).close()
      } finally {
        await server.close()
      }
    })

    test('rejects on a JSON-RPC error', async () => {
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          socket.write(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              error: { code: -32602, message: 'invalid params' },
            }),
          )
      })
      try {
        const transport = ipc.ipc(server.path).setup({})
        await expect(
          transport.subscribe({ params: ['newHeads'] }),
        ).rejects.toBeInstanceOf(RpcResponse.BaseError)
        const client = await transport.getRpcClient()
        expect(client.subscriptions.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('routes interleaved notifications to the matching subscription', async () => {
      let count = 0
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          count++
          socket.write(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              result: `0xsub${count}`,
            }),
          )
        }
      })
      try {
        const transport = ipc.ipc(server.path).setup({})
        const a: unknown[] = []
        const b: unknown[] = []
        const subA = await transport.subscribe({ params: ['newHeads'] })
        subA.onData((d) => a.push(d))
        const subB = await transport.subscribe({ params: ['newHeads'] })
        subB.onData((d) => b.push(d))
        const socket = [...server.sockets].at(-1)!
        const notify = (subscription: string, result: unknown) =>
          socket.write(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: { subscription, result },
            }),
          )
        notify('0xsub1', 1)
        notify('0xsub2', 2)
        notify('0xsub1', 3)
        await wait(50)
        expect(a).toEqual([
          { subscription: '0xsub1', result: 1 },
          { subscription: '0xsub1', result: 3 },
        ])
        expect(b).toEqual([{ subscription: '0xsub2', result: 2 }])
        ;(await transport.getRpcClient()).close()
      } finally {
        await server.close()
      }
    })

    test('ignores notifications for unknown subscriptions', async () => {
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          socket.write(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
      })
      try {
        const transport = ipc.ipc(server.path).setup({})
        const data: unknown[] = []
        const sub = await transport.subscribe({ params: ['newHeads'] })
        sub.onData((d) => data.push(d))
        const socket = [...server.sockets].at(-1)!
        socket.write(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_subscription',
            params: { subscription: '0xunknown', result: 1 },
          }),
        )
        await wait(30)
        expect(data).toEqual([])
        ;(await transport.getRpcClient()).close()
      } finally {
        await server.close()
      }
    })

    test('unsubscribe removes the entry before the ack and ignores later notifications', async () => {
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          socket.write(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
        if (request.method === 'eth_unsubscribe')
          socket.write(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: true }),
          )
      })
      try {
        const transport = ipc.ipc(server.path).setup({})
        const client = await transport.getRpcClient()
        const data: unknown[] = []
        const sub = await transport.subscribe({ params: ['newHeads'] })
        sub.onData((d) => data.push(d))
        const unsubscribed = sub.unsubscribe()
        // The local entry is removed synchronously, before the ack.
        expect(client.subscriptions.has('0xsub')).toBe(false)
        const response = await unsubscribed
        expect(response.result).toBe(true)
        const socket = [...server.sockets].at(-1)!
        socket.write(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_subscription',
            params: { subscription: '0xsub', result: 1 },
          }),
        )
        await wait(30)
        expect(data).toEqual([])
        client.close()
      } finally {
        await server.close()
      }
    })

    test('notifies an active subscription on close', async () => {
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          socket.write(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
      })
      try {
        const transport = ipc
          .ipc(server.path, {
            keepAlive: false,
            reconnect: false,
          })
          .setup({})
        const client = await transport.getRpcClient()
        let errored: unknown
        const sub = await transport.subscribe({ params: ['newHeads'] })
        sub.onError((error) => {
          errored = error
        })
        server.dropAll()
        await wait(50)
        expect(errored).toBeInstanceOf(RpcClient.SocketClosedError)
        expect(client.subscriptions.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('resubscribes active subscriptions after a reconnect', async () => {
      let count = 0
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          count++
          socket.write(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              result: `0xsub${count}`,
            }),
          )
        }
      })
      try {
        const transport = ipc
          .ipc(server.path, {
            keepAlive: false,
            reconnect: {
              minReconnectionDelay: 10,
              maxReconnectionDelay: 10,
              minUptime: 10,
            },
          })
          .setup({})
        await transport.subscribe({ params: ['newHeads'] })
        await transport.subscribe({ params: ['newHeads'] })
        expect(count).toBe(2)
        server.dropAll()
        await wait(500)
        expect(count).toBe(4)
        ;(await transport.getRpcClient()).close()
      } finally {
        await server.close()
      }
    })

    test('routes data to the new subscription id after a reconnect', async () => {
      let count = 0
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          count++
          socket.write(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              result: `0xsub${count}`,
            }),
          )
        }
      })
      try {
        const transport = ipc
          .ipc(server.path, {
            keepAlive: false,
            reconnect: {
              minReconnectionDelay: 10,
              maxReconnectionDelay: 10,
              minUptime: 10,
            },
          })
          .setup({})
        const data: unknown[] = []
        const sub = await transport.subscribe({ params: ['newHeads'] })
        sub.onData((d) => data.push(d))
        server.dropAll()
        await wait(300)
        expect(count).toBe(2)
        const socket = [...server.sockets].at(-1)!
        const notify = (subscription: string) =>
          socket.write(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: { subscription, result: 1 },
            }),
          )
        // The old id is gone; only the new id reaches `onData`.
        notify('0xsub1')
        notify('0xsub2')
        await wait(50)
        expect(data).toEqual([{ subscription: '0xsub2', result: 1 }])
        ;(await transport.getRpcClient()).close()
      } finally {
        await server.close()
      }
    })

    test('does not resubscribe an unsubscribed subscription after a reconnect', async () => {
      let count = 0
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          count++
          socket.write(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              result: `0xsub${count}`,
            }),
          )
        }
        if (request.method === 'eth_unsubscribe')
          socket.write(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: true }),
          )
      })
      try {
        const transport = ipc
          .ipc(server.path, {
            keepAlive: false,
            reconnect: {
              minReconnectionDelay: 10,
              maxReconnectionDelay: 10,
              minUptime: 10,
            },
          })
          .setup({})
        const sub = await transport.subscribe({ params: ['newHeads'] })
        await sub.unsubscribe()
        server.dropAll()
        await wait(300)
        expect(count).toBe(1)
        ;(await transport.getRpcClient()).close()
      } finally {
        await server.close()
      }
    })

    test('reconnect: false clears subscriptions on close', async () => {
      const server = await Ipc.createServer((socket, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          socket.write(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
      })
      try {
        const transport = ipc
          .ipc(server.path, {
            keepAlive: false,
            reconnect: false,
          })
          .setup({})
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
  })

  test('rejects in-flight requests when the socket closes', async () => {
    const server = await Ipc.createServer((socket) => socket.destroy())
    try {
      const transport = ipc
        .ipc(server.path, {
          keepAlive: false,
          reconnect: false,
          retryCount: 0,
        })
        .setup({})
      const client = await transport.getRpcClient()
      await expect(
        client.request({ body: { method: 'eth_chainId' } }),
      ).rejects.toBeInstanceOf(RpcClient.SocketClosedError)
      client.close()
    } finally {
      await server.close()
    }
  })

  test('times out when the server does not respond', async () => {
    const server = await Ipc.createServer(() => {})
    try {
      const transport = ipc
        .ipc(server.path, {
          keepAlive: false,
          retryCount: 0,
          timeout: 50,
        })
        .setup({})
      await expect(
        transport.request({ method: 'eth_chainId' }),
      ).rejects.toBeInstanceOf(RpcClient.TimeoutError)
      ;(await transport.getRpcClient()).close()
    } finally {
      await server.close()
    }
  })

  describe('keep-alive', () => {
    test('sends keep-alive messages', async () => {
      let pings = 0
      const server = await Ipc.createServer((_socket, message) => {
        if (JSON.parse(message).method === 'net_version') pings++
      })
      try {
        const transport = ipc
          .ipc(server.path, {
            keepAlive: { interval: 30 },
          })
          .setup({})
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
      const server = await Ipc.createServer((_socket, message) => {
        if (JSON.parse(message).method === 'net_version') pings++
      })
      try {
        const transport = ipc.ipc(server.path, { keepAlive: false }).setup({})
        await transport.getRpcClient()
        await wait(80)
        expect(pings).toBe(0)
        ;(await transport.getRpcClient()).close()
      } finally {
        await server.close()
      }
    })
  })
})
