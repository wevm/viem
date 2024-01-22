import { assertType, describe, expect, test } from 'vitest'

import { localIpcPath } from '~test/src/constants.js'
import { testClient } from '~test/src/utils.js'

import { mine } from '../../actions/test/mine.js'
import { localhost } from '../../chains/index.js'
import { wait } from '../../utils/wait.js'

import { type IpcTransport, ipc } from './ipc.js'

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
          "getSocketClient": [Function],
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
          "getSocketClient": [Function],
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
          "getSocketClient": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })
})

test('getSocketClient', async () => {
  const transport = ipc(localIpcPath)
  const socket = await transport({}).value?.getSocketClient()
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
  await mine(testClient, { blocks: 1 })
  await wait(200)
  expect(blocks.length).toBe(1)

  // Make sure we unsubscribe.
  const { result } = await unsubscribe()
  expect(result).toBeDefined()

  // Make sure we are no longer receiving blocks.
  await mine(testClient, { blocks: 1 })
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
