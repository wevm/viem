import {
  type RequestListener,
  createServer as createHttpServer,
} from 'node:http'
import type { AddressInfo } from 'node:net'
import { onTestFinished } from 'vitest'

/** A minimal real HTTP server for tests. */
export function createServer(
  handler: RequestListener,
): Promise<{ close: () => Promise<unknown>; url: string }> {
  const server = createHttpServer(handler)

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

type RpcProxyReply =
  | { error: { code: number; data?: unknown; message: string } }
  | { result: unknown }
  | undefined

/**
 * Serves JSON-RPC on an ephemeral HTTP server that forwards each request to
 * `url`, or responds with the reply that `getReply` returns for it. The server
 * closes when the test finishes.
 */
export async function createRpcProxy(
  url: string,
  getReply: (request: {
    method: string
    params: readonly unknown[]
  }) => RpcProxyReply | Promise<RpcProxyReply>,
) {
  const server = await createServer(async (req, res) => {
    let body = ''
    for await (const chunk of req) body += chunk
    const request = JSON.parse(body)
    // A failing `getReply` answers with a JSON-RPC error instead of leaving
    // the request hanging.
    const reply = await Promise.resolve(getReply(request)).catch(
      (error: Error) => ({ error: { code: -32603, message: error.message } }),
    )

    res.setHeader('Content-Type', 'application/json')
    if (reply) {
      res.end(JSON.stringify({ ...reply, id: request.id, jsonrpc: '2.0' }))
      return
    }
    const response = await fetch(url, {
      body,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    res.end(await response.text())
  })
  onTestFinished(async () => {
    await server.close()
  })
  return server.url
}
