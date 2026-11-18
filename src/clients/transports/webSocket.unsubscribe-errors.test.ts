import { once } from 'node:events'
import { webSocket } from 'viem'
import { expect, test } from 'vitest'
import { WebSocketServer } from 'ws'

test.each(['closed', 'open', 'silent'] as const)(
  'settles unsubscribe and releases its request (%s socket)',
  async (state) => {
    const server = new WebSocketServer({ host: '127.0.0.1', port: 0 })
    await once(server, 'listening')
    const address = server.address()
    if (typeof address === 'string' || !address)
      throw new Error('Expected TCP address')
    server.on('connection', (peer) => {
      peer.on('message', (message) => {
        const request = JSON.parse(message.toString())
        if (request.method === 'eth_unsubscribe' && state === 'silent') return
        peer.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: request.id,
            result:
              request.method === 'eth_subscribe' ? '0xsubscription' : true,
          }),
        )
      })
    })
    const transport = webSocket(`ws://127.0.0.1:${address.port}`, {
      reconnect: false,
      keepAlive: false,
      timeout: 200,
    })({ retryCount: 0 })
    const client = await transport.value!.getRpcClient()
    let timer: ReturnType<typeof setTimeout> | undefined

    try {
      const subscription = await transport.value!.subscribe({
        params: ['newHeads'],
        onData() {},
      })
      if (state === 'closed') {
        const closed = new Promise<void>((resolve) =>
          client.socket.addEventListener('close', () => resolve(), {
            once: true,
          }),
        )
        for (const peer of server.clients) peer.terminate()
        await closed
      }
      const result = await Promise.race([
        subscription
          .unsubscribe()
          .catch((error: unknown) => ({ status: 'rejected', error })),
        new Promise<string>((resolve) => {
          timer = setTimeout(() => resolve('pending'), 1000)
        }),
      ])

      if (state === 'open')
        expect(result).toMatchObject({ jsonrpc: '2.0', result: true })
      else if (state === 'silent')
        expect(result).toMatchObject({
          status: 'rejected',
          error: { name: 'TimeoutError' },
        })
      else expect(result).toMatchObject({ status: 'rejected' })
      expect(client.requests.size).toBe(0)
      expect(client.subscriptions.size).toBe(0)
    } finally {
      clearTimeout(timer)
      client.close()
      for (const peer of server.clients) peer.terminate()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  },
)
