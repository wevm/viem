import { expectTypeOf, test } from 'vitest'

import { localhost } from '../chains/index.js'
import { type EIP1193RequestFn } from '../types/eip1193.js'
import { type PublicClient, createPublicClient } from './createPublicClient.js'
import { http } from './transports/http.js'

test('with chain', () => {
  const client = createPublicClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createPublicClient({ transport: http() })
  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})

test('with custom rpc schema', () => {
  type MockRpcSchema = [
    {
      Method: 'eth_wagmi'
      Parameters: [string]
      ReturnType: string
    },
  ]

  const client = createPublicClient<
    ReturnType<typeof http>,
    undefined,
    MockRpcSchema
  >({
    transport: http(),
  })

  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.request).toEqualTypeOf<EIP1193RequestFn<MockRpcSchema>>()
})
