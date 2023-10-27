import type { Address } from 'abitype'
import { describe, expectTypeOf, test } from 'vitest'

import type { Account, JsonRpcAccount } from '../accounts/types.js'
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

describe('extend', () => {
  test('default', () => {
    const client = createClient({
      chain: localhost,
      transport: http(),
    })

    const extended = client
      .extend((config) => ({
        getChainId: async () => config.chain.id,
        foo: 'bar',
      }))
      .extend(() => ({}))
      .extend((config) => ({ bar: `${config.foo}baz` }))

    expectTypeOf(extended).toMatchTypeOf<Client>()
    expectTypeOf(extended.bar).toEqualTypeOf<'barbaz'>()
    expectTypeOf(extended.foo).toEqualTypeOf<'bar'>()
    expectTypeOf(extended.getChainId).toEqualTypeOf<() => Promise<1337>>()
  })

  test('protected action', () => {
    const client = createClient({
      chain: localhost,
      transport: http(),
    })

    client.extend(() => ({
      async sendTransaction(args) {
        expectTypeOf(args.account).toEqualTypeOf<Address | Account>()
        expectTypeOf(args.to).toEqualTypeOf<Address | null | undefined>()
        expectTypeOf(args.value).toEqualTypeOf<bigint | undefined>()
        return '0x'
      },
    }))

    client.extend(() => ({
      // @ts-expect-error: Type 'string' is not assignable to type 'Promise<`0x${string}`>'.
      sendTransaction() {
        return '0x'
      },
    }))

    client.extend(() => ({
      // @ts-expect-error: Type '"bogus"' is not assignable to type '`0x${string}`'.
      async sendTransaction() {
        return 'bogus'
      },
    }))

    client.extend(() => ({
      // @ts-expect-error: Type 'SendTransactionParameters<Chain | undefined, Account | undefined, TChainOverride>' is not assignable to type 'number'.
      async sendTransaction(_args: number) {
        return '0x'
      },
    }))
  })
})
