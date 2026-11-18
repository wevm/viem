import { mkdtemp, rm } from 'node:fs/promises'
import { createServer, type Socket } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SocketClosedError } from 'viem'
import { ipc } from 'viem/node'
import { expect, test } from 'vitest'

test('rejects a subscription when the peer closes before acknowledging it', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'viem-sub-'))
  const path = join(directory, 'rpc.ipc')
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(path, resolve))
  const connected = new Promise<Socket>((resolve) =>
    server.once('connection', resolve),
  )
  const transport = ipc(path, { reconnect: false })({ retryCount: 0 })
  const client = await transport.value!.getRpcClient()
  const peer = await connected
  peer.on('data', () => peer.destroy())
  const errors: Error[] = []
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    const result = await Promise.race([
      transport
        .value!.subscribe({
          params: ['newHeads'],
          onData() {},
          onError(error) {
            errors.push(error)
          },
        })
        .then(
          () => 'resolved',
          (error: Error) => error,
        ),
      new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve('pending'), 1000)
      }),
    ])

    expect(result).toBeInstanceOf(SocketClosedError)
    expect(errors.map((error) => error.name)).toMatchInlineSnapshot(`
      [
        "SocketClosedError",
      ]
    `)
    expect(client.requests.size).toBe(0)
  } finally {
    clearTimeout(timer)
    client.close()
    peer.destroy()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await rm(directory, { recursive: true, force: true })
  }
})
