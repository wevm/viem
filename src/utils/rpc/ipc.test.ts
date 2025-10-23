import { anvil } from 'prool/instances'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getBlockNumber, mine } from '../../actions/index.js'
import { createClient, http } from '../../index.js'
import type { RpcResponse } from '../../types/rpc.js'
import { numberToHex } from '../index.js'
import { wait } from '../wait.js'
import { extractMessages, getIpcRpcClient } from './ipc.js'

const client = createClient({
  chain: anvilMainnet.chain,
  transport: http('http://127.0.0.1:6968'),
}).extend(() => ({ mode: 'anvil' }))

const instance = anvil({
  port: 6968,
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

describe('getIpcRpcClient', () => {
  test('creates IPC instance', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    expect(rpcClient).toBeDefined()
    expect(rpcClient.socket.readyState).toEqual('open')
    rpcClient.close()
  })

  test('multiple invocations on a url only opens one socket', async () => {
    const [client1, client2, client3, client4] = await Promise.all([
      getIpcRpcClient(anvilMainnet.rpcUrl.ipc),
      getIpcRpcClient(anvilMainnet.rpcUrl.ipc),
      getIpcRpcClient(anvilMainnet.rpcUrl.ipc),
      getIpcRpcClient(anvilMainnet.rpcUrl.ipc),
    ])
    expect(client1).toEqual(client2)
    expect(client1).toEqual(client3)
    expect(client1).toEqual(client4)
    client1.close()
  })
})

describe('request', () => {
  test('valid request', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const { id, ...version } = await new Promise<any>((resolve) =>
      rpcClient.request({
        body: { method: 'web3_clientVersion' },
        onResponse: resolve,
      }),
    )
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v1.4.3",
      }
    `)
    expect(rpcClient.requests.size).toBe(0)
    rpcClient.close()
  })

  test('valid request', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const { id } = await new Promise<any>((resolve) =>
      rpcClient.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(anvilMainnet.forkBlockNumber), false],
        },
        onResponse: resolve,
      }),
    )
    expect(id).toBeDefined()
    expect(rpcClient.requests.size).toBe(0)
    rpcClient.close()
  })

  test('invalid request', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    await expect(
      new Promise<any>((resolve, reject) =>
        rpcClient.request({
          body: {
            method: 'wagmi_lol',
          },
          onError: reject,
          onResponse: resolve,
        }),
      ),
    ).resolves.toMatchInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 1,
        "jsonrpc": "2.0",
      }
    `,
    )
    expect(rpcClient.requests.size).toBe(0)
  })

  test('invalid request (closing socket)', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    await wait(1000)
    rpcClient.close()
    await expect(
      () =>
        new Promise<any>((resolve, reject) =>
          rpcClient.request({
            body: {
              method: 'wagmi_lol',
            },
            onError: reject,
            onResponse: resolve,
          }),
        ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [WebSocketRequestError: WebSocket request failed.

      URL: http://localhost
      Request body: {"jsonrpc":"2.0","id":1,"method":"wagmi_lol"}

      Details: Socket is closed.
      Version: viem@x.y.z]
    `,
    )
    await wait(100)
  })

  test('invalid request (closed socket)', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    rpcClient.close()
    await wait(1000)
    await expect(
      () =>
        new Promise<any>((resolve, reject) =>
          rpcClient.request({
            body: {
              method: 'wagmi_lol',
            },
            onError: reject,
            onResponse: resolve,
          }),
        ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [WebSocketRequestError: WebSocket request failed.

      URL: http://localhost
      Request body: {"jsonrpc":"2.0","id":1,"method":"wagmi_lol"}

      Details: Socket is closed.
      Version: viem@x.y.z]
    `,
    )
  })
})

describe('request (subscription)', () => {
  test('basic', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const data_: RpcResponse[] = []
    rpcClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => data_.push(data),
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(rpcClient.subscriptions.size).toBe(1)
    expect(data_.length).toBe(3)
    await rpcClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(data_[0] as any).result],
      },
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(rpcClient.subscriptions.size).toBe(0)
    expect(data_.length).toBe(3)
    rpcClient.close()
  })

  test('multiple', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const s1: RpcResponse[] = []
    rpcClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => s1.push(data),
    })
    const s2: RpcResponse[] = []
    rpcClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => s2.push(data),
    })
    const s3: RpcResponse[] = []
    rpcClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newPendingTransactions'],
      },
      onResponse: (data) => s3.push(data),
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(500)
    expect(rpcClient.requests.size).toBe(0)
    expect(rpcClient.subscriptions.size).toBe(3)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(3)
    expect(s3.length).toBe(1)
    await rpcClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s1[0] as any).result],
      },
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(rpcClient.requests.size).toBe(0)
    expect(rpcClient.subscriptions.size).toBe(2)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(5)
    expect(s3.length).toBe(1)
    await rpcClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s2[0] as any).result],
      },
    })
    await rpcClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s3[0] as any).result],
      },
    })
    await wait(2000)
    expect(rpcClient.requests.size).toBe(0)
    expect(rpcClient.subscriptions.size).toBe(0)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(5)
    expect(s3.length).toBe(1)
    rpcClient.close()
  })

  test('invalid subscription', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    let err_: RpcResponse | undefined
    client.request({
      body: {
        method: 'eth_subscribe',
        params: ['fakeHeadz'],
      },
      onResponse: (err) => (err_ = err),
    })
    await wait(500)
    expect(client.requests.size).toBe(0)
    expect(client.subscriptions.size).toBe(0)
    expect(err_).toMatchInlineSnapshot(`
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 1,
        "jsonrpc": "2.0",
      }
    `)
  })
})

describe('requestAsync', () => {
  test('valid request', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const { id, ...version } = await client.requestAsync({
      body: { method: 'web3_clientVersion' },
    })
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v1.4.3",
      }
    `)
    expect(client.requests.size).toBe(0)
  })

  test('valid request', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const { id } = await client.requestAsync({
      body: {
        method: 'eth_getBlockByNumber',
        params: [numberToHex(anvilMainnet.forkBlockNumber), false],
      },
    })
    expect(id).toBeDefined()
    expect(client.requests.size).toBe(0)
  })

  test('serial requests', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const response: any = []
    for (const i in Array.from({ length: 10 })) {
      response.push(
        await client.requestAsync({
          body: {
            method: 'eth_getBlockByNumber',
            params: [
              numberToHex(anvilMainnet.forkBlockNumber - BigInt(i)),
              false,
            ],
          },
        }),
      )
    }
    expect(response.map((r: any) => r.result.number)).toEqual(
      Array.from({ length: 10 }).map((_, i) =>
        numberToHex(anvilMainnet.forkBlockNumber - BigInt(i)),
      ),
    )
    expect(client.requests.size).toBe(0)
  })

  test('parallel requests', async () => {
    await wait(500)

    await mine(client, { blocks: 100 })
    const blockNumber = await getBlockNumber(client)

    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const response = await Promise.all(
      Array.from({ length: 100 }).map(async (_, i) => {
        return await rpcClient.requestAsync({
          body: {
            method: 'eth_getBlockByNumber',
            params: [numberToHex(blockNumber - BigInt(i)), false],
          },
        })
      }),
    )
    expect(response.map((r) => r.result.number)).toEqual(
      Array.from({ length: 100 }).map((_, i) =>
        numberToHex(blockNumber - BigInt(i)),
      ),
    )
    expect(rpcClient.requests.size).toBe(0)
    await wait(500)
  }, 30_000)

  test('invalid request', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    await expect(
      client.requestAsync({
        body: {
          method: 'wagmi_lol',
        },
      }),
    ).resolves.toThrowErrorMatchingInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 1,
        "jsonrpc": "2.0",
      }
    `,
    )
  })

  test.skip('timeout', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)

    await expect(() =>
      client.requestAsync({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(5115n), false],
        },
        timeout: 10,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
        [TimeoutError: The request took too long to respond.

        URL: http://localhost
        Request body: {"method":"eth_getBlockByNumber","params":["0x13fb",false]}

        Details: The request timed out.
        Version: viem@x.y.z]
      `,
    )
  })
})

describe('extractMessages', () => {
  test('default', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from('{"jsonrpc":"2.0","id":1,"result":1}'),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot(
      `
      [
        "{"jsonrpc":"2.0","id":1,"result":1}",
      ]
    `,
    )
    expect(remaining.toString()).toMatchInlineSnapshot(`""`)
  })

  test('remainder', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from('{"jsonrpc":"2.0","id":1,'),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot('[]')
    expect(remaining.toString()).toMatchInlineSnapshot(
      `"{"jsonrpc":"2.0","id":1,"`,
    )
  })

  test('multiple, no remainder', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from(
        '{"jsonrpc":"2.0","id":1,"result":1}{"jsonrpc":"2.0","id":2,"result":1}{"jsonrpc":"2.0","id":3,"result":1}',
      ),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot(
      `
      [
        "{"jsonrpc":"2.0","id":1,"result":1}",
        "{"jsonrpc":"2.0","id":2,"result":1}",
        "{"jsonrpc":"2.0","id":3,"result":1}",
      ]
    `,
    )
    expect(remaining.toString()).toMatchInlineSnapshot(`""`)
  })

  test('multiple, remainder', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from(
        '{"jsonrpc":"2.0","id":1,"result":1}{"jsonrpc":"2.0","id":2,"result":1}{"jsonrpc":"2.0","id":3,"result":1}{"jsonrpc":"2.0","id":4,"result":{{{}}',
      ),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot(
      `
      [
        "{"jsonrpc":"2.0","id":1,"result":1}",
        "{"jsonrpc":"2.0","id":2,"result":1}",
        "{"jsonrpc":"2.0","id":3,"result":1}",
      ]
    `,
    )
    expect(remaining.toString()).toMatchInlineSnapshot(
      `"{"jsonrpc":"2.0","id":4,"result":{{{}}"`,
    )
  })

  test('whitespace', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from(
        '  {"jsonrpc":"2.0","id":1,"result":1} \n     {"jsonrpc":"2.0","id":2,"result":{"ok": {"ok": "haha"}}}  ',
      ),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot(
      `
      [
        "{"jsonrpc":"2.0","id":1,"result":1}",
        "{"jsonrpc":"2.0","id":2,"result":{"ok": {"ok": "haha"}}}",
      ]
    `,
    )
    expect(remaining.toString()).toMatchInlineSnapshot(`""`)
  })
})
