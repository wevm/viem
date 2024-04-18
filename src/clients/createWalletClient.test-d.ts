import { expectTypeOf, test } from 'vitest'

import type { JsonRpcAccount } from '../accounts/types.js'
import { localhost } from '../chains/index.js'
import { rpcSchema } from './createClient.js'
import { type WalletClient, createWalletClient } from './createWalletClient.js'
import { http } from './transports/http.js'

test('with chain', () => {
  const client = createWalletClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createWalletClient({
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})

test('with account', () => {
  const client = createWalletClient({
    account: '0x',
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.account).toEqualTypeOf<JsonRpcAccount<'0x'>>({
    address: '0x',
    type: 'json-rpc',
  })
})

test('without account', () => {
  const client = createWalletClient({
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.account).toEqualTypeOf(undefined)
})

test('with custom rpc schema', async () => {
  type MockRpcSchema = [
    {
      Method: 'eth_wagmi'
      Parameters: [string]
      ReturnType: string
    },
  ]

  const client = createWalletClient({
    rpcSchema: rpcSchema<MockRpcSchema>(),
    transport: http(),
  })

  expectTypeOf(client).toMatchTypeOf<WalletClient>()

  const result = await client.request({
    method: 'eth_wagmi',
    params: ['hello'],
  })
  expectTypeOf(result).toEqualTypeOf<string>()
})
