import { createServer, type RequestListener } from 'node:http'
import type { AddressInfo } from 'node:net'

export function createHttpServer(
  handler: RequestListener,
): Promise<{ close: () => Promise<unknown>; url: string }> {
  const server = createServer(handler)

  const closeAsync = () =>
    new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve(undefined))),
    )

  return new Promise((resolve) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo
      resolve({ close: closeAsync, url: `http://localhost:${port}` })
    })
  })
}
