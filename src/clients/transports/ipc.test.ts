import { createAnvil } from '@viem/anvil'
import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'

import { forkBlockNumber, forkUrl, localIpcPath } from '~test/src/constants.js'
import { anvilChain } from '~test/src/utils.js'

import { mine } from '../../actions/test/mine.js'
import { localhost } from '../../chains/index.js'
import { wait } from '../../utils/wait.js'

import { createClient } from '../createClient.js'
import { http } from './http.js'
import { type IpcTransport, ipc } from './ipc.js'

const client = createClient({
  chain: anvilChain,
  transport: http('http://127.0.0.1:6969'),
}).extend(() => ({ mode: 'anvil' }))

const anvil = createAnvil({
  port: 6969,
  ipc: localIpcPath,
  forkBlockNumber,
  forkUrl,
})

beforeAll(async () => {
  await anvil.start()
})

afterAll(async () => {
  await anvil.stop()
})

test('default', () => {
  const transport = ipc(localIpcPath)

  assertType<IpcTransport>(transport)
  assertType<'ipc'>(transport({}).config.type)

  expect(transport).toMatchInlineSnapshot('[Function]')
})

describe('config', () => {
  test('key', () => {
    const transport = ipc(localIpcPath, {
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
    const transport = ipc(localIpcPath, {
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
  const transport = ipc(localIpcPath)
  const socket = await transport({}).value?.getRpcClient()
  expect(socket).toBeDefined()
})

test('errors: rpc error', async () => {
  const transport = ipc(localIpcPath, {
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
    Version: viem@1.0.2]
  `)
})

test('subscribe', async () => {
  const transport = ipc(localIpcPath, {
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
  const transport = ipc(localIpcPath, {
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
