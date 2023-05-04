import type { JsonRpcAccount } from '../accounts/types.js'
import { type WalletClient, createWalletClient } from './createWalletClient.js'
import { http } from './transports/http.js'
import { localhost } from '@wagmi/chains'
import { expectTypeOf, test } from 'vitest'

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
