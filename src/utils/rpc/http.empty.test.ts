import { createServer } from 'node:http'
import { createPublicClient, HttpRequestError, http } from 'viem'
import { expect, test } from 'vitest'

// Exercise real responses, including the no-content-type path used by proxies.
test.each([undefined, 'text/plain', 'application/json'])(
  'rejects an empty successful response (%s)',
  async (contentType) => {
    const server = createServer((request, response) => {
      request.resume()
      if (contentType) response.setHeader('Content-Type', contentType)
      response.end()
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string')
      throw new Error('Expected TCP address')
    const client = createPublicClient({
      transport: http(`http://127.0.0.1:${address.port}`, { retryCount: 0 }),
    })

    try {
      await expect(
        client.sendRawTransaction({ serializedTransaction: '0x02c0' }),
      ).rejects.toBeInstanceOf(HttpRequestError)
    } finally {
      server.closeAllConnections()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  },
)

test.each(['0x1234', null])(
  'preserves a valid JSON result without content type: %s',
  async (result) => {
    const server = createServer(async (request, response) => {
      let body = ''
      for await (const chunk of request) body += chunk
      const { id } = JSON.parse(body)
      response.end(JSON.stringify({ jsonrpc: '2.0', id, result }))
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string')
      throw new Error('Expected TCP address')
    const client = createPublicClient({
      transport: http(`http://127.0.0.1:${address.port}`, { retryCount: 0 }),
    })

    try {
      expect(await client.request({ method: 'web3_clientVersion' })).toEqual(
        result,
      )
    } finally {
      server.closeAllConnections()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  },
)
