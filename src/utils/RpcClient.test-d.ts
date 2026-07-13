import type { RpcResponse } from 'ox'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { RpcClient } from 'viem/utils'

const client = RpcClient.http('https://example.com')

test('single body: result typed from its method', async () => {
  const response = await client.request({ body: { method: 'eth_chainId' } })
  expectTypeOf(response.result).toEqualTypeOf<`0x${string}` | undefined>()
})

test('single body: non-schema method falls back to unknown', async () => {
  const response = await client.request({ body: { method: 'foo_bar' } })
  expectTypeOf(response.result).toEqualTypeOf<unknown>()
})

test('batch body: maps element-wise to a typed tuple', async () => {
  const responses = await client.request({
    body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
  })
  expectTypeOf(responses).toEqualTypeOf<
    [
      RpcResponse.RpcResponse<`0x${string}`>,
      RpcResponse.RpcResponse<`0x${string}`>,
    ]
  >()
})

test('batch body: mixes schema and non-schema methods per element', async () => {
  const responses = await client.request({
    body: [{ method: 'eth_chainId' }, { method: 'foo_bar' }],
  })
  expectTypeOf(responses[0].result).toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf(responses[1].result).toEqualTypeOf<unknown>()
})

test('socket: request accepts a timeout and preserves response inference', async () => {
  const socket = {} as RpcClient.Socket
  const response = await socket.request({
    body: { method: 'eth_chainId' },
    timeout: 1_000,
  })
  expectTypeOf(response.result).toEqualTypeOf<`0x${string}` | undefined>()

  const responses = await socket.request({
    body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
  })
  expectTypeOf(responses).toEqualTypeOf<
    [
      RpcResponse.RpcResponse<`0x${string}`>,
      RpcResponse.RpcResponse<`0x${string}`>,
    ]
  >()
})

const schema = z.RpcSchema.from({
  abe_foo: { params: z.tuple([z.number()]), returns: z.string() },
})

test('schema (zod): http result typed from the supplied schema', async () => {
  const client = RpcClient.http('https://example.com', { schema })
  const response = await client.request({
    body: { method: 'abe_foo', params: [1] },
  })
  expectTypeOf(response.result).toEqualTypeOf<string | undefined>()
})

test('schema (zod): http batch typed element-wise from the schema', async () => {
  const client = RpcClient.http('https://example.com', { schema })
  const responses = await client.request({
    body: [
      { method: 'abe_foo', params: [1] },
      { method: 'abe_foo', params: [2] },
    ],
  })
  expectTypeOf(responses).toEqualTypeOf<
    [RpcResponse.RpcResponse<string>, RpcResponse.RpcResponse<string>]
  >()
})

test('schema (zod): webSocket result typed from the supplied schema', async () => {
  const socket = await RpcClient.webSocket('wss://example.com', { schema })
  const response = await socket.request({
    body: { method: 'abe_foo', params: [1] },
  })
  expectTypeOf(response.result).toEqualTypeOf<string | undefined>()
})

test('schema (zod): fromSocket result typed from the supplied schema', async () => {
  const socket = await RpcClient.fromSocket({
    cacheKey: 'test',
    createConnection: () => ({ send() {}, close() {} }),
    schema,
    url: 'wss://example.com',
  })
  const response = await socket.request({
    body: { method: 'abe_foo', params: [1] },
  })
  expectTypeOf(response.result).toEqualTypeOf<string | undefined>()
})
