import { expectTypeOf, test } from 'vitest'

import { localhost } from '../chains/index.js'
import { rpcSchema } from './createClient.js'
import { type TestClient, createTestClient } from './createTestClient.js'
import { http } from './transports/http.js'

test('with chain', () => {
  const client = createTestClient({
    chain: localhost,
    mode: 'anvil',
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<TestClient>()
  expectTypeOf(client.mode).toEqualTypeOf<'anvil'>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createTestClient({
    mode: 'anvil',
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<TestClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})

test('with custom rpc schema', async () => {
  type MockRpcSchema = [
    {
      Method: 'eth_wagmi'
      Parameters: [string]
      ReturnType: string
    },
  ]

  const client = createTestClient({
    mode: 'anvil',
    rpcSchema: rpcSchema<MockRpcSchema>(),
    transport: http(),
  })

  expectTypeOf(client).toMatchTypeOf<TestClient>()

  const result = await client.request({
    method: 'eth_wagmi',
    params: ['hello'],
  })
  expectTypeOf(result).toEqualTypeOf<string>()
})
