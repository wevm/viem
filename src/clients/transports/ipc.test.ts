import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Instance } from 'prool'
import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { mine } from '../../actions/test/mine.js'
import { localhost } from '../../chains/index.js'
import { createMessageExtractor } from '../../utils/rpc/ipc.js'
import { wait } from '../../utils/wait.js'

import { createClient } from '../createClient.js'
import { http } from './http.js'
import { type IpcTransport, ipc } from './ipc.js'

const client = createClient({
  chain: anvilMainnet.chain,
  transport: http('http://127.0.0.1:6967'),
}).extend(() => ({ mode: 'anvil' }))

const instance = Instance.anvil({
  chainId: anvilMainnet.chain.id,
  port: 6967,
  ipc: anvilMainnet.rpcUrl.ipc,
  forkBlockNumber: anvilMainnet.forkBlockNumber,
  forkUrl: anvilMainnet.forkUrl,
})

beforeAll(async () => {
  await instance.start()
})

afterAll(async () => {
  await instance.stop()
})

test('default', () => {
  const transport = ipc(anvilMainnet.rpcUrl.ipc)

  assertType<IpcTransport>(transport)
  assertType<'ipc'>(transport({}).config.type)

  expect(transport).toMatchInlineSnapshot('[Function]')
})

describe('config', () => {
  test('key', () => {
    const transport = ipc(anvilMainnet.rpcUrl.ipc, {
      key: 'mock',
    })

    expect(transport({})).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "methods": undefined,
          "name": "IPC JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "ipc",
        },
        "request": [Function],
        "value": {
          "getRpcClient": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })

  test('name', () => {
    const transport = ipc(anvilMainnet.rpcUrl.ipc, {
      name: 'Mock Transport',
    })

    expect(transport({})).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "ipc",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "ipc",
        },
        "request": [Function],
        "value": {
          "getRpcClient": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })

  test('url', () => {
    const transport = ipc('https://mockapi.com/rpc')

    expect(transport({})).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "ipc",
          "methods": undefined,
          "name": "IPC JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "ipc",
        },
        "request": [Function],
        "value": {
          "getRpcClient": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })
})

test('getRpcClient', async () => {
  const transport = ipc(anvilMainnet.rpcUrl.ipc)
  const socket = await transport({}).value?.getRpcClient()
  expect(socket).toBeDefined()
})

test('errors: rpc error', async () => {
  const transport = ipc(anvilMainnet.rpcUrl.ipc, {
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
  const transport = ipc(anvilMainnet.rpcUrl.ipc, {
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

test('behavior: requests and subscriptions share one socket', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'viem-ipc-'))
  const path = join(directory, 'rpc.ipc')
  let connections = 0
  const server = createServer((socket) => {
    // Each connection answers with its own number, so a response shows which
    // connection served it.
    const result = `0x${(++connections).toString(16)}`
    socket.on(
      'data',
      createMessageExtractor((message) => {
        const { id } = JSON.parse(message.toString())
        socket.write(JSON.stringify({ id, jsonrpc: '2.0', result }))
      }),
    )
  })
  await new Promise<void>((resolve) => server.listen(path, resolve))

  const transport = ipc(path, { reconnect: { attempts: 1 } })({})
  if (!transport.value) return
  const blockNumber = await transport.request({ method: 'eth_blockNumber' })
  const { subscriptionId } = await transport.value.subscribe({
    params: ['newHeads'],
    onData() {},
  })

  // Both were served by the first connection.
  expect({ blockNumber, subscriptionId }).toMatchInlineSnapshot(`
    {
      "blockNumber": "0x1",
      "subscriptionId": "0x1",
    }
  `)

  const rpcClient = await transport.value.getRpcClient()
  rpcClient.close()
  await new Promise((resolve) => server.close(resolve))
  await rm(directory, { recursive: true, force: true })
})

test('throws on bogus subscription', async () => {
  const transport = ipc(anvilMainnet.rpcUrl.ipc, {
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

test('behavior: socket closure rejects a pending subscription', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'viem-ipc-'))
  const path = join(directory, 'rpc.ipc')
  // Closes the connection before answering `eth_subscribe`.
  const server = createServer((socket) =>
    socket.on('data', () => socket.destroy()),
  )
  await new Promise<void>((resolve) => server.listen(path, resolve))

  const transport = ipc(path, { reconnect: false })({})
  if (!transport.value) return
  const errors: Error[] = []
  await expect(
    transport.value.subscribe({
      params: ['newHeads'],
      onData() {},
      onError: (error) => errors.push(error),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [SocketClosedError: The socket has been closed.

    URL: http://localhost

    Version: viem@x.y.z]
  `)
  expect(errors).toMatchInlineSnapshot(`
    [
      [SocketClosedError: The socket has been closed.

    URL: http://localhost

    Version: viem@x.y.z],
    ]
  `)

  await new Promise((resolve) => server.close(resolve))
  await rm(directory, { recursive: true, force: true })
})

test('behavior: socket closure calls onError for a subscription', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'viem-ipc-'))
  const path = join(directory, 'rpc.ipc')
  const server = createServer((socket) =>
    socket.on(
      'data',
      createMessageExtractor((message) => {
        const { id } = JSON.parse(message.toString())
        socket.write(JSON.stringify({ id, jsonrpc: '2.0', result: '0x1' }))
      }),
    ),
  )
  await new Promise<void>((resolve) => server.listen(path, resolve))

  const transport = ipc(path, { reconnect: false })({})
  if (!transport.value) return
  const errors: Error[] = []
  await transport.value.subscribe({
    params: ['newHeads'],
    onData() {},
    onError: (error) => errors.push(error),
  })
  const { socket } = await transport.value.getRpcClient()
  socket.destroy()
  await wait(100)

  expect(errors).toMatchInlineSnapshot(`
    [
      [SocketClosedError: The socket has been closed.

    URL: http://localhost

    Version: viem@x.y.z],
    ]
  `)

  await new Promise((resolve) => server.close(resolve))
  await rm(directory, { recursive: true, force: true })
})
