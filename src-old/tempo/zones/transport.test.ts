import { Secp256k1 } from 'ox'
import { createClient, createWalletClient, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { getBlockNumber } from 'viem/actions'
import { describe, expect, test } from 'vitest'
import { createHttpServer } from '~test/utils.js'
import { decorator } from '../Decorator.js'
import * as Storage from '../Storage.js'
import { http } from './transport.js'
import { zoneModerato } from './zone.js'

const zone = zoneModerato(6)

describe('http transport', () => {
  test('injects X-Authorization-Token header from storage', async () => {
    const storage = Storage.memory()
    await storage.setItem(`auth:token:${zone.id}`, 'deadbeef1234')

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
        transport: http(undefined, { storage }),
      })

      await getBlockNumber(client)

      expect(headers).toHaveLength(1)
      expect(headers[0]!['x-authorization-token']).toBe('deadbeef1234')
    } finally {
      await server.close()
    }
  })

  test('proceeds without header when no token in storage', async () => {
    const storage = Storage.memory()

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
        transport: http(undefined, { storage }),
      })

      await getBlockNumber(client)

      expect(headers).toHaveLength(1)
      expect(headers[0]!['x-authorization-token']).toBeUndefined()
    } finally {
      await server.close()
    }
  })

  test('signed token is injected into subsequent requests', async () => {
    const storage = Storage.memory()
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
        transport: http(undefined, { storage }),
      }).extend(decorator())

      await client.zone.signAuthorizationToken({ storage })
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
