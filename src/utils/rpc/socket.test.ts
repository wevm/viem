import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { wait } from '../wait.js'
import { getSocketRpcClient } from './socket.js'

test('default', async () => {
  let active = false
  const socketClient = await getSocketRpcClient({
    key: 'test-socket',
    async getSocket() {
      active = true
      return {
        active,
        close() {},
        request() {},
      }
    },
    url: anvilMainnet.rpcUrl.ws,
  })
  expect(socketClient.socket.active).toBeTruthy()

  socketClient.close()
})

test('parallel invocations of same url returns identical client', async () => {
  let count = 0

  const socketClient = async () =>
    getSocketRpcClient({
      key: 'test-socket',
      async getSocket() {
        count++
        return {
          count,
          close() {},
          request() {},
        }
      },
      url: anvilMainnet.rpcUrl.ws,
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
      key: 'test-socket',
      async getSocket() {
        count++
        return {
          count,
          close() {},
          request() {},
        }
      },
      url: anvilMainnet.rpcUrl.ws,
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
    key: 'test-socket',
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: body })
        },
      }
    },
    url: anvilMainnet.rpcUrl.ws,
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
      "id": 4,
      "jsonrpc": "2.0",
      "result": {
        "id": 4,
        "jsonrpc": "2.0",
        "method": "test",
      },
    }
  `)

  socketClient.close()
})

test('reconnect', async () => {
  let active = true
  let count = -1
  const socketClient = await getSocketRpcClient({
    key: 'test-socket',
    async getSocket({ onError, onOpen, onResponse }) {
      count++

      // reopen on 3rd attempt
      if (active || count === 3) {
        onOpen()
        active = true
      } else {
        onError(new Error('connection failed.'))
        active = false
      }

      return {
        close() {},
        request({ body }) {
          wait(100).then(() => {
            if (!active) return
            onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: body })

            wait(100).then(() => {
              if (count === 0) onError(new Error('connection failed.'))
              active = false
            })
          })
        },
      }
    },
    reconnect: {
      delay: 200,
      attempts: 5,
    },
    url: anvilMainnet.rpcUrl.ws,
  })

  await wait(200)

  expect(
    await new Promise((res, rej) => {
      socketClient.request({
        body: { method: 'test' },
        onResponse(data) {
          res(data)
        },
        onError(error) {
          rej(error)
        },
      })
    }),
  ).toMatchInlineSnapshot(`
    {
      "id": 6,
      "jsonrpc": "2.0",
      "result": {
        "id": 6,
        "jsonrpc": "2.0",
        "method": "test",
      },
    }
  `)

  await wait(200)

  await expect(
    () =>
      new Promise((res, rej) => {
        socketClient.request({
          body: { method: 'test' },
          onResponse(data) {
            res(data)
          },
          onError(error) {
            rej(error)
          },
        })
      }),
  ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: connection failed.]')

  await wait(1000)

  expect(
    await new Promise((res, rej) => {
      socketClient.request({
        body: { method: 'test' },
        onResponse(data) {
          res(data)
        },
        onError(error) {
          rej(error)
        },
      })
    }),
  ).toMatchInlineSnapshot(`
    {
      "id": 8,
      "jsonrpc": "2.0",
      "result": {
        "id": 8,
        "jsonrpc": "2.0",
        "method": "test",
      },
    }
  `)

  socketClient.close()
})

test('request (eth_subscribe)', async () => {
  const socketClient = await getSocketRpcClient({
    key: 'test-socket',
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: '0xabc' })
        },
      }
    },
    url: anvilMainnet.rpcUrl.ws,
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
      "id": 10,
      "jsonrpc": "2.0",
      "result": "0xabc",
    }
  `)

  expect(socketClient.subscriptions.size).toBe(1)

  socketClient.close()
})

test('reconnect (eth_subscribe)', async () => {
  let active = true
  let count = -1
  const socketClient = await getSocketRpcClient({
    key: 'test-socket',
    async getSocket({ onError, onOpen, onResponse }) {
      count++

      // reopen on 3rd attempt
      if (active || count === 3) {
        onOpen()
        active = true
      } else {
        onError(new Error('connection failed.'))
        active = false
      }

      return {
        close() {},
        request({ body }) {
          wait(100).then(() => {
            if (!active) return
            onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: '0xabc' })

            wait(100).then(() => {
              if (count === 0) onError(new Error('connection failed.'))
              active = false
            })
          })
        },
      }
    },
    reconnect: {
      delay: 200,
      attempts: 5,
    },
    url: anvilMainnet.rpcUrl.ws,
  })

  await wait(200)

  expect(
    await new Promise((res, rej) => {
      socketClient.request({
        body: { method: 'eth_subscribe' },
        onResponse(data) {
          res(data)
        },
        onError(error) {
          rej(error)
        },
      })
    }),
  ).toMatchInlineSnapshot(`
    {
      "id": 12,
      "jsonrpc": "2.0",
      "result": "0xabc",
    }
  `)

  await wait(200)

  await expect(
    () =>
      new Promise((res, rej) => {
        socketClient.request({
          body: { method: 'eth_subscribe' },
          onResponse(data) {
            res(data)
          },
          onError(error) {
            rej(error)
          },
        })
      }),
  ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: connection failed.]')

  await wait(1000)

  expect(
    await new Promise((res, rej) => {
      socketClient.request({
        body: { method: 'eth_subscribe' },
        onResponse(data) {
          res(data)
        },
        onError(error) {
          rej(error)
        },
      })
    }),
  ).toMatchInlineSnapshot(`
    {
      "id": 14,
      "jsonrpc": "2.0",
      "result": "0xabc",
    }
  `)

  socketClient.close()
})

test('request (eth_unsubscribe)', async () => {
  const socketClient = await getSocketRpcClient({
    key: 'test-socket',
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: '0xabc' })
        },
      }
    },
    url: anvilMainnet.rpcUrl.ws,
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
      "id": 16,
      "jsonrpc": "2.0",
      "result": "0xabc",
    }
  `)

  expect(socketClient.subscriptions.size).toBe(0)

  socketClient.close()
})

test('request (eth_subscription)', async () => {
  const socketClient = await getSocketRpcClient({
    key: 'test-socket',
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
    url: anvilMainnet.rpcUrl.ws,
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
      "id": 18,
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
    key: 'test-socket',
    async getSocket() {
      return {
        close() {},
        request() {
          throw new Error('test')
        },
      }
    },
    url: anvilMainnet.rpcUrl.ws,
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
    key: 'test-socket',
    async getSocket({ onResponse }) {
      return {
        close() {},
        request({ body }) {
          onResponse({ id: body.id ?? 0, jsonrpc: '2.0', result: body })
        },
      }
    },
    url: anvilMainnet.rpcUrl.ws,
  })

  const response = await socketClient.requestAsync({
    body: { method: 'test' },
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "id": 22,
      "jsonrpc": "2.0",
      "result": {
        "id": 22,
        "jsonrpc": "2.0",
        "method": "test",
      },
    }
  `)

  socketClient.close()
})
