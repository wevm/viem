import { expectTypeOf, test } from 'vitest'

import type { JsonRpcAccount } from '../accounts/types.js'
import { localhost } from '../chains/index.js'
import { type EIP1193RequestFn } from '../types/eip1193.js'
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

test('with custom rpc schema', () => {
  type MockRpcSchema = [
    {
      Method: 'wallet_wagmi'
      Parameters: [string]
      ReturnType: string
    },
  ]

  const client = createWalletClient<
    ReturnType<typeof http>,
    undefined,
    undefined,
    MockRpcSchema
  >({
    transport: http(),
  })

  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.request).toEqualTypeOf<EIP1193RequestFn<MockRpcSchema>>()
})
