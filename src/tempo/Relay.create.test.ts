import { createRequestListener } from '@remix-run/node-fetch-server'
import * as RpcResponse from 'ox/RpcResponse'
import { createClient, createClientResolver, http } from 'viem'
import { tempo, tempoModerato } from 'viem/chains'
import { Relay, Store, Transaction } from 'viem/tempo'
import { expect, test } from 'vitest'
import { chain, getClient } from '~test/tempo/config.js'
import { createHttpServer } from '~test/utils.js'

const client = getClient()

function request(body: unknown) {
  return new Request('https://relay.example', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

test('create forwards through a single client with its default chain', async () => {
  const relay = Relay.create({ client })
  expect(await relay.request({ method: 'eth_chainId' })).toBe(
    await client.request({ method: 'eth_chainId' }),
  )
  const response = await relay.fetch(
    request({ jsonrpc: '2.0', id: 0, method: 'eth_chainId' }),
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({
    jsonrpc: '2.0',
    id: 0,
    result: await client.request({ method: 'eth_chainId' }),
  })
})

test('create resolves clients lazily and requires a chain only when forwarding', async () => {
  const resolver = createClientResolver({
    chains: [chain],
    transport: () => http(),
  })
  const relay = Relay.create({
    getClient: resolver.getClient,
    plugins: [
      (next) => (request, options) =>
        request.method === 'relay_status'
          ? Promise.resolve('ready')
          : next(request, options),
    ],
  })
  expect(await relay.request({ method: 'relay_status' })).toMatchInlineSnapshot(
    `"ready"`,
  )
  await expect(relay.request({ method: 'eth_chainId' })).rejects.toThrow(
    'A chain ID is required',
  )
  expect(
    await relay.request({ method: 'eth_chainId' }, { chainId: chain.id }),
  ).toBe(await client.request({ method: 'eth_chainId' }))
  await expect(
    relay.request({ method: 'eth_chainId' }, { chainId: 1 as never }),
  ).rejects.toThrow('not configured')
})

test.each([0, -1, 1.5, NaN, Infinity])(
  'create rejects invalid chain %s',
  async (chainId) => {
    const relay = Relay.create({ client })
    await expect(
      relay.request({ method: 'eth_chainId' }, { chainId: chainId as never }),
    ).rejects.toThrow('Expected a valid chain ID')
  },
)

test('create rejects missing, duplicate, and unconfigured client options', () => {
  expect(() => Relay.create({} as never)).toThrow('Expected exactly one')
  expect(() =>
    Relay.create({ client, getClient: () => client } as never),
  ).toThrow('Expected exactly one')
  expect(() =>
    Relay.create({
      client: createClient({ transport: http('https://rpc.example') }),
    } as never),
  ).toThrow('configured chain')
})

test('create rejects conflicting client, request, and signed payload chains', async () => {
  const relay = Relay.create({
    client,
    plugins: [Relay.multisig({ store: Store.memory() })],
  })
  await expect(
    relay.request({ method: 'eth_chainId' }, { chainId: 1 as never }),
  ).rejects.toThrow('Conflicting chain ids')
  const transaction = await Transaction.serialize({ calls: [], chainId: 1 })
  await expect(
    relay.request({ method: 'eth_sendRawTransaction', params: [transaction] }),
  ).rejects.toThrow('Conflicting chain ids')
  const wrongResolver = Relay.create({ getClient: () => client })
  await expect(
    wrongResolver.request({ method: 'eth_chainId' }, { chainId: 1 as never }),
  ).rejects.toThrow('Conflicting chain ids')
})

test('multisig infers the chain before client resolution', async () => {
  const resolver = createClientResolver({
    chains: [tempo, tempoModerato],
    transport: () => http(),
  })
  const relay = Relay.create({
    getClient: resolver.getClient,
    plugins: [Relay.multisig({ store: Store.memory() })],
  })
  const transaction = await Transaction.serialize({ calls: [], chainId: 1 })
  await expect(
    relay.request({ method: 'eth_sendRawTransaction', params: [transaction] }),
  ).rejects.toThrow('Chain with id 1 is not configured')
})

test('fetch works as an unbound HTTP handler with a real Viem client', async () => {
  const relay = Relay.create({ client })
  const server = await createHttpServer(createRequestListener(relay.fetch))
  try {
    const remote = createClient({
      transport: http(server.url),
    })
    expect(await remote.request({ method: 'eth_chainId' })).toBe(
      await client.request({ method: 'eth_chainId' }),
    )
    await expect(
      remote.request({ method: 'relay_unknown' } as never, { retryCount: 0 }),
    ).rejects.toMatchObject({ code: -32601 })
  } finally {
    await server.close()
  }
})

test('fetch batches calls and executes notifications without responses', async () => {
  const store = Store.memory()
  const relay = Relay.create({
    client,
    plugins: [
      (next) => async (request, options) => {
        if (request.method === 'relay_put') {
          await store.setItem('value', request.params?.[0] as string)
          return null
        }
        return next(request, options)
      },
    ],
  })
  const response = await relay.fetch(
    request([
      { jsonrpc: '2.0', id: 'chain', method: 'eth_chainId' },
      { jsonrpc: '2.0', method: 'relay_put', params: ['saved'] },
      { jsonrpc: '2.0', id: null, method: 'relay_unknown' },
      false,
    ]),
  )
  const body = await response.json()
  expect(body).toHaveLength(3)
  expect(body[0]).toMatchObject({ id: 'chain' })
  expect(body[1]).toMatchObject({ id: null, error: { code: -32601 } })
  expect(body[2]).toEqual({
    jsonrpc: '2.0',
    id: null,
    error: { code: -32600, message: 'Invalid Request' },
  })
  expect(await store.getItem('value')).toBe('saved')
  for (const body of [
    { jsonrpc: '2.0', method: 'relay_put', params: ['single'] },
    [{ jsonrpc: '2.0', method: 'relay_put', params: ['batch'] }],
    { jsonrpc: '2.0', method: 'relay_unknown' },
    { jsonrpc: '2.0', method: 'eth_chainId', params: {} },
  ]) {
    const response = await relay.fetch(request(body))
    expect(response.status).toBe(204)
    expect(await response.text()).toBe('')
  }
  expect(await store.getItem('value')).toBe('batch')
})

test.each([
  null,
  [],
  {},
  1,
  'invalid',
  { jsonrpc: '1.0', method: 'eth_chainId' },
  { jsonrpc: '2.0', method: 1 },
  { jsonrpc: '2.0', method: 'eth_chainId', id: {} },
  { jsonrpc: '2.0', method: 'eth_chainId', params: null },
])('fetch rejects invalid requests: %j', async (body) => {
  const relay = Relay.create({ client })
  expect(await (await relay.fetch(request(body))).json()).toEqual({
    jsonrpc: '2.0',
    id: null,
    error: { code: -32600, message: 'Invalid Request' },
  })
})

test('fetch rejects malformed JSON and unsupported HTTP requests', async () => {
  const relay = Relay.create({ client })
  const malformed = new Request('https://relay.example', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  })
  expect(await (await relay.fetch(malformed)).json()).toEqual({
    jsonrpc: '2.0',
    id: null,
    error: { code: -32700, message: 'Parse error' },
  })
  const get = await relay.fetch(new Request('https://relay.example'))
  expect(get.status).toBe(405)
  expect(get.headers.get('allow')).toBe('POST')
  expect(
    (
      await relay.fetch(
        new Request('https://relay.example', { method: 'POST', body: '{}' }),
      )
    ).status,
  ).toBe(415)
})

test('fetch preserves RPC errors and hides internal exceptions', async () => {
  const relay = Relay.create({
    client,
    plugins: [
      () => async (request) => {
        if (request.method === 'relay_invalid')
          throw new RpcResponse.InvalidParamsError({
            message: 'Invalid token',
            data: { token: 'bad' },
          })
        if (request.method === 'relay_bigint') return 1n
        throw new Error('secret implementation detail')
      },
    ],
  })
  const responses = await (
    await relay.fetch(
      request([
        { jsonrpc: '2.0', id: 1, method: 'relay_invalid' },
        { jsonrpc: '2.0', id: 2, method: 'relay_internal' },
        { jsonrpc: '2.0', id: 3, method: 'relay_bigint' },
        { jsonrpc: '2.0', id: 4, method: 'relay_invalid', params: {} },
      ]),
    )
  ).json()
  expect(responses).toEqual([
    {
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32602, message: 'Invalid token', data: { token: 'bad' } },
    },
    {
      jsonrpc: '2.0',
      id: 2,
      error: { code: -32603, message: 'Internal error' },
    },
    {
      jsonrpc: '2.0',
      id: 3,
      error: { code: -32603, message: 'Internal error' },
    },
    {
      jsonrpc: '2.0',
      id: 4,
      error: { code: -32602, message: 'Expected positional RPC parameters.' },
    },
  ])
})

test('fetch preserves request options and cancellation', async () => {
  const relay = Relay.create({
    client,
    plugins: [
      () => async (_, options) => ({
        chainId: options?.chainId,
        retryCount: options?.retryCount,
        aborted: options?.signal?.aborted,
      }),
    ],
  })
  const response = await relay.fetch(
    request({ jsonrpc: '2.0', id: 1, method: 'relay_options' }),
    { retryCount: 0, signal: AbortSignal.abort() },
  )
  expect(await response.json()).toEqual({
    jsonrpc: '2.0',
    id: 1,
    result: { chainId: chain.id, retryCount: 0, aborted: true },
  })
})
