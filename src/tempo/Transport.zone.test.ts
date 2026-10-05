import { Secp256k1 } from 'ox'
import { Account, Client, http, Store } from 'viem/tempo'
import { zoneModerato } from 'viem/tempo/zones'
import { expect, test } from 'vitest'
import { createServer } from '~test/http.js'

import { signAuthorizationToken } from './actions/zone/signAuthorizationToken.js'

const zone = zoneModerato(6)

test('behavior: custom metadata', () => {
  const transport = http(undefined, {
    key: 'zone-http',
    name: 'Zone HTTP',
  })

  expect({
    key: transport.key,
    name: transport.name,
    type: transport.type,
  }).toMatchInlineSnapshot(`
    {
      "key": "zone-http",
      "name": "Zone HTTP",
      "type": "http",
    }
  `)
})

/** Boots a JSON-RPC server that records request headers. */
async function createRpcServer() {
  const headers: Record<string, string | undefined>[] = []
  const server = await createServer((req, res) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      headers.push({
        custom: req.headers['x-custom'] as string | undefined,
        token: req.headers['x-authorization-token'] as string | undefined,
      })
      const request = JSON.parse(body)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }))
    })
  })
  return { ...server, headers }
}

test('injects X-Authorization-Token header from store', async () => {
  const store = Store.memory()
  await store.setItem(`auth:token:${zone.id}`, 'deadbeef1234')

  const server = await createRpcServer()
  try {
    const client = Client.create({
      chain: zone,
      transport: http(server.url, { store }),
    })

    await client.request({ method: 'eth_blockNumber' })

    expect(server.headers).toEqual([
      { custom: undefined, token: 'deadbeef1234' },
    ])
  } finally {
    await server.close()
  }
})

test('proceeds without header when no token in store', async () => {
  const server = await createRpcServer()
  try {
    const client = Client.create({
      chain: zone,
      transport: http(server.url, { store: Store.memory() }),
    })

    await client.request({ method: 'eth_blockNumber' })

    expect(server.headers).toEqual([{ custom: undefined, token: undefined }])
  } finally {
    await server.close()
  }
})

test('proceeds without header when no chain is configured', async () => {
  const server = await createRpcServer()
  try {
    const client = Client.create({
      chain: undefined,
      transport: http(server.url, { store: Store.memory() }),
    })

    await client.request({ method: 'eth_blockNumber' })

    expect(server.headers).toEqual([{ custom: undefined, token: undefined }])
  } finally {
    await server.close()
  }
})

test('behavior: signed token is injected into subsequent requests', async () => {
  const store = Store.memory()
  const account = Account.fromSecp256k1(Secp256k1.randomPrivateKey())

  const server = await createRpcServer()
  try {
    const client = Client.create({
      account,
      chain: zone,
      transport: http(server.url, { store }),
    })

    const { token } = await signAuthorizationToken(client, { store })
    await client.request({ method: 'eth_blockNumber' })

    expect(server.headers).toEqual([{ custom: undefined, token }])
  } finally {
    await server.close()
  }
})

test('behavior: user `onFetchRequest` is preserved', async () => {
  const store = Store.memory()
  await store.setItem(`auth:token:${zone.id}`, 'deadbeef1234')

  const server = await createRpcServer()
  try {
    const client = Client.create({
      chain: zone,
      transport: http(server.url, {
        async onFetchRequest(_request, init) {
          const headers = new Headers(init.headers)
          headers.set('X-Custom', 'hello')
          return { ...init, headers }
        },
        store,
      }),
    })

    await client.request({ method: 'eth_blockNumber' })

    // The zone token is layered on top of the user's modified init.
    expect(server.headers).toEqual([{ custom: 'hello', token: 'deadbeef1234' }])
  } finally {
    await server.close()
  }
})
