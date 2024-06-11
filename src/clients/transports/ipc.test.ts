import { anvil } from 'prool/instances'
import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { mine } from '../../actions/test/mine.js'
import { localhost } from '../../chains/index.js'
import { wait } from '../../utils/wait.js'

import { createClient } from '../createClient.js'
import { http } from './http.js'
import { type IpcTransport, ipc } from './ipc.js'

const client = createClient({
  chain: anvilMainnet.chain,
  transport: http('http://127.0.0.1:6967'),
}).extend(() => ({ mode: 'anvil' }))

const instance = anvil({
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
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    URL: http://localhost
    Request body: {"method":"eth_wagmi"}

    Details: data did not match any variant of untagged enum EthRpcCall
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
