import { expect, test } from 'vitest'
import { localWsUrl } from '../../../test/src/constants.js'
import { getSocketRpcClient } from './socket.js'

test('default', async () => {
  let active = false
  const socketClient = await getSocketRpcClient({
    async getSocket() {
      active = true
      return {
        active,
        close() {},
        request() {},
      }
    },
    url: localWsUrl,
  })
  expect(socketClient.socket.active).toBeTruthy()

  socketClient.close()
})

test('parallel invocations of same url returns identical client', async () => {
  let count = 0

  const socketClient = async () =>
    getSocketRpcClient({
      async getSocket() {
        count++
        return {
          count,
          close() {},
          request() {},
        }
      },
      url: localWsUrl,
    })

  const [client1, client2, client3, client4] = await Promise.all([
    socketClient(),
    socketClient(),
    socketClient(),
    socketClient(),
  ])

  expect(client1.socket.count).toBe(1)
  expect(client1).toBe(client2)

  expect(client2.socket.count).toBe(1)
  expect(client2).toBe(client3)

  expect(client3.socket.count).toBe(1)
  expect(client3).toBe(client4)

  expect(client4.socket.count).toBe(1)
  expect(client4).toBe(client1)

  client1.close()
})

test('sequential invocations of same url returns identical client', async () => {
  let count = 0

  const socketClient = async () =>
    getSocketRpcClient({
      async getSocket() {
        count++
        return {
          count,
          close() {},
          request() {},
        }
      },
      url: localWsUrl,
    })

  const client1 = await socketClient()
  const client2 = await socketClient()
  const client3 = await socketClient()
  const client4 = await socketClient()

  expect(client1.socket.count).toBe(1)
  expect(client1).toBe(client2)

  expect(client2.socket.count).toBe(1)
  expect(client2).toBe(client3)

  expect(client3.socket.count).toBe(1)
  expect(client3).toBe(client4)

  expect(client4.socket.count).toBe(1)
  expect(client4).toBe(client1)

  client1.close()
})

test('request', async () => {
  const socketClient = await getSocketRpcClient({
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: body })
        },
      }
    },
    url: localWsUrl,
  })

  const response = await new Promise((res) => {
    socketClient.request({
      body: { method: 'test' },
      onResponse: (data) => {
        res(data)
      },
    })
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "id": 0,
      "jsonrpc": "2.0",
      "result": {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "test",
      },
    }
  `)

  socketClient.close()
})

test('request (eth_subscribe)', async () => {
  const socketClient = await getSocketRpcClient({
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: '0xabc' })
        },
      }
    },
    url: localWsUrl,
  })

  const response = await new Promise((res) => {
    socketClient.request({
      body: { method: 'eth_subscribe' },
      onResponse: (data) => {
        res(data)
      },
    })
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "id": 1,
      "jsonrpc": "2.0",
      "result": "0xabc",
    }
  `)

  expect(socketClient.subscriptions.size).toBe(1)

  socketClient.close()
})

test('request (eth_unsubscribe)', async () => {
  const socketClient = await getSocketRpcClient({
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: '0xabc' })
        },
      }
    },
    url: localWsUrl,
  })

  const response = await new Promise((res) => {
    socketClient.request({
      body: { method: 'eth_unsubscribe', params: ['0xabc'] },
      onResponse: (data) => {
        res(data)
      },
    })
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "id": 2,
      "jsonrpc": "2.0",
      "result": "0xabc",
    }
  `)

  expect(socketClient.subscriptions.size).toBe(0)

  socketClient.close()
})

test('request (eth_subscription)', async () => {
  const socketClient = await getSocketRpcClient({
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: '0xabc' })

          setTimeout(() => {
            onResponse({
              id: body.id ?? 1,
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: { subscription: '0xabc', result: 'ok' },
            })
          }, 50)
        },
      }
    },
    url: localWsUrl,
  })

  const response = await new Promise((res) => {
    socketClient.request({
      body: { method: 'eth_subscribe' },
      onResponse: (data) => {
        if (data.method !== 'eth_subscription') return
        res(data)
      },
    })
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "id": 3,
      "jsonrpc": "2.0",
      "method": "eth_subscription",
      "params": {
        "result": "ok",
        "subscription": "0xabc",
      },
    }
  `)

  expect(socketClient.subscriptions.size).toBe(1)

  socketClient.close()
})

test('request (error)', async () => {
  const socketClient = await getSocketRpcClient({
    async getSocket() {
      return {
        close() {},
        request() {
          throw new Error('test')
        },
      }
    },
    url: localWsUrl,
  })

  const response = await new Promise((res) => {
    socketClient.request({
      body: { method: 'test' },
      onError: (error) => {
        res(error)
      },
      onResponse: () => {},
    })
  })
  expect(response).toMatchInlineSnapshot('[Error: test]')

  socketClient.close()
})

test('requestAsync', async () => {
  const socketClient = await getSocketRpcClient({
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: body })
        },
      }
    },
    url: localWsUrl,
  })

  const response = await socketClient.requestAsync({
    body: { method: 'test' },
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "id": 5,
      "jsonrpc": "2.0",
      "result": {
        "id": 5,
        "jsonrpc": "2.0",
        "method": "test",
      },
    }
  `)

  socketClient.close()
})
