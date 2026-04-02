import { Secp256k1 } from 'ox'
import { createClient, createWalletClient, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { describe, expect, test } from 'vitest'
import { createHttpServer } from '~test/utils.js'
import { decorator } from '../Decorator.js'
import * as Storage from '../Storage.js'
import { http } from './transport.js'
import { zone003 } from './zone003.js'

describe('http transport', () => {
  test('injects X-Authorization-Token header from storage', async () => {
    const storage = Storage.memory()
    await storage.setItem(`auth:token:${zone003.id}`, 'deadbeef1234')

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
        ...zone003,
        rpcUrls: { default: { http: [server.url] } },
      })

      const client = createClient({
        chain,
        transport: http(undefined, { storage }),
      })

      await client.request({ method: 'eth_blockNumber', params: [] })

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
        ...zone003,
        rpcUrls: { default: { http: [server.url] } },
      })

      const client = createClient({
        chain,
        transport: http(undefined, { storage }),
      })

      await client.request({ method: 'eth_blockNumber', params: [] })

      expect(headers).toHaveLength(1)
      expect(headers[0]!['x-authorization-token']).toBeUndefined()
    } finally {
      await server.close()
    }
  })

  test('does not batch requests', async () => {
    const storage = Storage.memory()
    let requestCount = 0

    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk
      requestCount++

      const request = JSON.parse(body)
      expect(Array.isArray(request)).toBe(false)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }))
    })

    try {
      const chain = defineChain({
        ...zone003,
        rpcUrls: { default: { http: [server.url] } },
      })

      const client = createClient({
        chain,
        transport: http(undefined, { storage }),
      })

      await Promise.all([
        client.request({ method: 'eth_blockNumber', params: [] }),
        client.request({ method: 'eth_blockNumber', params: [] }),
      ])

      expect(requestCount).toBe(2)
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
        ...zone003,
        rpcUrls: { default: { http: [server.url] } },
      })

      const client = createWalletClient({
        account,
        chain,
        transport: http(undefined, { storage }),
      }).extend(decorator())

      await client.zone.signAuthorizationToken({ storage })
      await client.request({ method: 'eth_blockNumber' })

      expect(receivedHeaders).toHaveLength(1)
      expect(receivedHeaders[0]).toBeDefined()
      expect(typeof receivedHeaders[0]).toBe('string')
      expect(receivedHeaders[0]!.length).toBeGreaterThan(0)
    } finally {
      await server.close()
    }
  })
})
