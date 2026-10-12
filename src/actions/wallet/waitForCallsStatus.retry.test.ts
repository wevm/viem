import { once } from 'node:events'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { expect, test } from 'vitest'
import { createClient, http } from '../../index.js'
import { waitForCallsStatus } from './waitForCallsStatus.js'

const retryDelay = () => {
  throw new Error('retry delay failed')
}

test.each([false, true])(
  'behavior: numeric and callback retry delays remain independent (numeric first: %s)',
  async (numericFirst) => {
    const server = createServer(async (req, res) => {
      let body = ''
      for await (const chunk of req) body += chunk
      const { id, params } = JSON.parse(body)
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            atomic: true,
            chainId: '0x1',
            id: params[0],
            receipts: [],
            status: 400,
            version: '2.0.0',
          },
        }),
      )
    })
    server.listen(0)
    await once(server, 'listening')
    const { port } = server.address() as AddressInfo
    const client = createClient({ transport: http(`http://localhost:${port}`) })
    const delays = numericFirst ? [1, retryDelay] : [retryDelay, 1]

    try {
      const results = await Promise.all(
        delays.map((retryDelay) =>
          waitForCallsStatus(client, {
            id: '0x01',
            pollingInterval: 1,
            retryCount: 1,
            retryDelay,
            throwOnFailure: true,
            timeout: 0,
          }).catch((error) => error.name),
        ),
      )

      expect(numericFirst ? results.reverse() : results).toMatchInlineSnapshot(`
        [
          "Error",
          "BundleFailedError",
        ]
      `)
    } finally {
      server.close()
      await once(server, 'close')
    }
  },
)
