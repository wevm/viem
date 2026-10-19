import { Secp256k1 } from 'ox'
import { createClient, createWalletClient, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { getBlockNumber } from 'viem/actions'
import { describe, expect, test } from 'vitest'
import { createHttpServer } from '~test/utils.js'
import { decorator } from './Decorator.js'
import * as Store from './Store.js'
import { http } from './Transport.js'
import * as Zone from './Zone.js'

const zone = Zone.internalTestnet

describe('http transport', () => {
  test('injects X-Authorization-Token header from store', async () => {
    const store = Store.memory()
    await store.setItem(`auth:token:${zone.id}`, 'deadbeef1234')

    const headers: Record<string, string>[] = []
    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk

      headers.push({
        'x-authorization-token': req.headers['x-authorization-token'] as string,
      })

      const request = JSON.parse(body)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }))
    })

    try {
      const chain = defineChain({
        ...zone,
        rpcUrls: { default: { http: [server.url] } },
      })

      const client = createClient({
        chain,
        transport: http(undefined, { store }),
      })

      await getBlockNumber(client)

      expect(headers).toHaveLength(1)
      expect(headers[0]!['x-authorization-token']).toBe('deadbeef1234')
    } finally {
      await server.close()
    }
  })

  test('proceeds without header when no token in store', async () => {
    const store = Store.memory()

    const headers: Record<string, string | undefined>[] = []
    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk

      headers.push({
        'x-authorization-token': req.headers['x-authorization-token'] as
          | string
          | undefined,
      })

      const request = JSON.parse(body)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }))
    })

    try {
      const chain = defineChain({
        ...zone,
        rpcUrls: { default: { http: [server.url] } },
      })

      const client = createClient({
        chain,
        transport: http(undefined, { store }),
      })

      await getBlockNumber(client)

      expect(headers).toHaveLength(1)
      expect(headers[0]!['x-authorization-token']).toBeUndefined()
    } finally {
      await server.close()
    }
  })

  test('proceeds without header when no chain is configured', async () => {
    const store = Store.memory()

    const headers: (string | undefined)[] = []
    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk

      headers.push(req.headers['x-authorization-token'] as string | undefined)

      const request = JSON.parse(body)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }))
    })

    try {
      const client = createClient({
        transport: http(server.url, { store }),
      })

      await getBlockNumber(client)

      expect(headers).toEqual([undefined])
    } finally {
      await server.close()
    }
  })

  test('signed token is injected into subsequent requests', async () => {
    const store = Store.memory()
    const account = privateKeyToAccount(Secp256k1.randomPrivateKey())

    const receivedHeaders: (string | undefined)[] = []
    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk

      receivedHeaders.push(
        req.headers['x-authorization-token'] as string | undefined,
      )

      const request = JSON.parse(body)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }))
    })

    try {
      const chain = defineChain({
        ...zone,
        rpcUrls: { default: { http: [server.url] } },
      })

      const client = createWalletClient({
        account,
        chain,
        transport: http(undefined, { store }),
      }).extend(decorator())

      await client.zone.signAuthorizationToken({ store })
      await getBlockNumber(client)

      expect(receivedHeaders).toHaveLength(1)
      expect(receivedHeaders[0]).toBeDefined()
      expect(typeof receivedHeaders[0]).toBe('string')
      expect(receivedHeaders[0]!.length).toBeGreaterThan(0)
    } finally {
      await server.close()
    }
  })
})
