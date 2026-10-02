import { mkdtemp, rm } from 'node:fs/promises'
import { createServer, type Socket } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'

import { TimeoutError } from '../../errors/request.js'
import { getIpcRpcClient } from './ipc.js'

// Use a real IPC connection whose peer can deliberately withhold responses.
async function createConnection() {
  const directory = await mkdtemp(join(tmpdir(), 'viem-rpc-'))
  const path = join(directory, 'rpc.ipc')
  const server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(path, resolve)
  })
  const connected = new Promise<Socket>((resolve) =>
    server.once('connection', resolve),
  )
  const client = await getIpcRpcClient(path, { reconnect: false })
  const peer = await connected
  peer.resume()

  return {
    client,
    peer,
    async close() {
      client.close()
      peer.destroy()
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      )
      await rm(directory, { recursive: true, force: true })
    },
  }
}

test.each([undefined, 42])(
  'removes timed-out requests (id: %s)',
  async (id) => {
    const connection = await createConnection()
    try {
      const body =
        id === undefined
          ? { method: 'eth_blockNumber' }
          : { id, method: 'eth_blockNumber' }
      await expect(
        connection.client.requestAsync({ body, timeout: 20 }),
      ).rejects.toBeInstanceOf(TimeoutError)
      expect(connection.client.requests.size).toBe(0)
    } finally {
      await connection.close()
    }
  },
)

test('does not accumulate callbacks across repeated timeouts', async () => {
  const connection = await createConnection()
  try {
    for (let index = 0; index < 8; index++) {
      await expect(
        connection.client.requestAsync({
          body: { method: 'eth_blockNumber' },
          timeout: 20,
        }),
      ).rejects.toBeInstanceOf(TimeoutError)
      expect(connection.client.requests.size).toBe(0)
    }
  } finally {
    await connection.close()
  }
})

test('a timeout does not remove another pending request', async () => {
  const connection = await createConnection()
  try {
    const first = connection.client.requestAsync({
      body: { id: 1, method: 'eth_blockNumber' },
      timeout: 20,
    })
    const second = connection.client.requestAsync({
      body: { id: 2, method: 'eth_blockNumber' },
      timeout: 0,
    })

    await expect(first).rejects.toBeInstanceOf(TimeoutError)
    expect([...connection.client.requests.keys()]).toEqual([2])
    connection.peer.write('{"jsonrpc":"2.0","id":2,"result":"0x1"}')
    await expect(second).resolves.toEqual({
      jsonrpc: '2.0',
      id: 2,
      result: '0x1',
    })
    expect(connection.client.requests.size).toBe(0)
  } finally {
    await connection.close()
  }
})

test('ignores a late subscription response after its request timed out', async () => {
  const connection = await createConnection()
  try {
    await expect(
      connection.client.requestAsync({
        body: { id: 1, method: 'eth_subscribe', params: ['newHeads'] },
        timeout: 20,
      }),
    ).rejects.toBeInstanceOf(TimeoutError)

    const next = connection.client.requestAsync({
      body: { id: 2, method: 'eth_blockNumber' },
      timeout: 0,
    })
    connection.peer.write(
      '{"jsonrpc":"2.0","id":1,"result":"0xsubscription"}' +
        '{"jsonrpc":"2.0","id":2,"result":"0x1"}',
    )
    await next
    expect(connection.client.requests.size).toBe(0)
    expect(connection.client.subscriptions.size).toBe(0)
  } finally {
    await connection.close()
  }
})

test('keeps successfully established subscriptions after request cleanup', async () => {
  const connection = await createConnection()
  try {
    const response = connection.client.requestAsync({
      body: { id: 1, method: 'eth_subscribe', params: ['newHeads'] },
      timeout: 0,
    })
    connection.peer.write('{"jsonrpc":"2.0","id":1,"result":"0xsubscription"}')
    await response
    expect(connection.client.requests.size).toBe(0)
    expect(connection.client.subscriptions.has('0xsubscription')).toBe(true)
  } finally {
    await connection.close()
  }
})
