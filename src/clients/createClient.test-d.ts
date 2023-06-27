import { localhost } from '@wagmi/chains'
import { expectTypeOf, test } from 'vitest'

import type { JsonRpcAccount } from '../accounts/types.js'
import { type Client, createClient } from './createClient.js'
import { http } from './transports/http.js'

test('with chain', () => {
  const client = createClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createClient({
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})

test('with account', () => {
  const client = createClient({
    account: '0x',
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.account).toEqualTypeOf<JsonRpcAccount<'0x'>>({
    address: '0x',
    type: 'json-rpc',
  })
})

test('without account', () => {
  const client = createClient({
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.account).toEqualTypeOf(undefined)
})

test('extend', () => {
  const client = createClient({
    chain: localhost,
    transport: http(),
  }).extend((config) => ({
    getChainId: () => config.chain?.id,
    foo: 'bar',
  }))
  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.foo).toEqualTypeOf<'bar'>()
  expectTypeOf(client.getChainId).toEqualTypeOf<() => 1337>()
})
