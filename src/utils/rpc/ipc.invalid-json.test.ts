import { mkdtemp, rm } from 'node:fs/promises'
import { createServer, type Socket } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { getIpcRpcClient } from './ipc.js'

test('rejects malformed IPC JSON through the request error path', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'viem-json-'))
  const path = join(directory, 'rpc.ipc')
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(path, resolve))
  const connected = new Promise<Socket>((resolve) =>
    server.once('connection', resolve),
  )
  const client = await getIpcRpcClient(path, { reconnect: false })
  const peer = await connected
  peer.on('data', () => peer.write('{"jsonrpc":"2.0","id":1,"result":}'))

  try {
    await expect(
      client.requestAsync({
        body: { id: 1, method: 'eth_chainId' },
        timeout: 100,
      }),
    ).rejects.toBeInstanceOf(SyntaxError)
    expect(client.requests.size).toBe(0)
  } finally {
    client.close()
    peer.destroy()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await rm(directory, { recursive: true, force: true })
  }
})
