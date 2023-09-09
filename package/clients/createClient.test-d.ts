import { expectTypeOf, test } from 'vitest'

import type { JsonRpcAccount } from '../accounts/types.js'
import { localhost } from '../chains/index.js'
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
  })

  const extended = client
    .extend((config) => ({
      getChainId: () => config.chain.id,
      foo: 'bar',
    }))
    .extend(() => ({}))
    .extend((config) => ({ bar: `${config.foo}baz` }))

  expectTypeOf(extended).toMatchTypeOf<Client>()
  expectTypeOf(extended.bar).toEqualTypeOf<'barbaz'>()
  expectTypeOf(extended.foo).toEqualTypeOf<'bar'>()
  expectTypeOf(extended.getChainId).toEqualTypeOf<() => 1337>()
})
