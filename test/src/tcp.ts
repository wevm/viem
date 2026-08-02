import { type Socket, connect, createServer } from 'node:net'
import type { AddressInfo } from 'node:net'

/**
 * A TCP proxy in front of `target` that can sever all live connections
 * (simulating a transport drop). New connections re-establish upstream.
 */
export async function createProxy(target: string) {
  const url = new URL(target)
  const sockets = new Set<Socket>()

  const server = createServer((downstream) => {
    const upstream = connect(Number(url.port), url.hostname)
    sockets.add(downstream)
    sockets.add(upstream)
    downstream.pipe(upstream)
    upstream.pipe(downstream)
    const teardown = () => {
      downstream.destroy()
      upstream.destroy()
      sockets.delete(downstream)
      sockets.delete(upstream)
    }
    downstream.on('close', teardown)
    upstream.on('close', teardown)
    downstream.on('error', () => {})
    upstream.on('error', () => {})
  })

  await new Promise<void>((resolve) => server.listen(0, () => resolve()))
  const { port } = server.address() as AddressInfo

  return {
    url: `${url.protocol}//${url.hostname}:${port}${url.pathname}`,
    /** Severs all live connections; the next dial re-establishes upstream. */
    drop() {
      for (const socket of sockets) socket.destroy()
    },
    close: () =>
      new Promise((resolve) => {
        for (const socket of sockets) socket.destroy()
        server.close(() => resolve(undefined))
      }),
  }
}
