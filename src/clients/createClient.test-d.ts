import type { Address } from 'abitype'
import { describe, expectTypeOf, test } from 'vitest'

import type { Account, JsonRpcAccount } from '../accounts/types.js'
import { localhost, optimism } from '../chains/index.js'
import {
  type EIP1193RequestFn,
  createPublicClient,
  publicActions,
} from '../index.js'
import type { Chain } from '../types/chain.js'
import { type Client, createClient, rpcSchema } from './createClient.js'
import { walletActions } from './decorators/wallet.js'
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

  test('chain w/ formatter', async () => {
    const client = createClient({
      chain: optimism,
      transport: http(),
    }).extend(publicActions)
    await client.getBlock()
    await client.getTransaction({ hash: '0x' })
  })

  test('protected action', () => {
    const client = createClient({
      chain: localhost,
      transport: http(),
    })

    client.extend(() => ({
      async sendTransaction(args) {
        expectTypeOf(args.account).toEqualTypeOf<Address | Account | null>()
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
      // @ts-expect-error: Type 'SendTransactionParameters<Chain | undefined, Account | undefined, chainOverride>' is not assignable to type 'number'.
      async sendTransaction(_args: number) {
        return '0x'
      },
    }))
  })

  test('protected action pass through generic', () => {
    function getClient<chain extends Chain | undefined>(
      chain?: chain | undefined,
    ) {
      const client = createClient({
        chain,
        transport: http(),
      })
      return client.extend(walletActions)
    }
    getClient(localhost)
  })
})

test('custom rpc schema', () => {
  type MockRpcSchema = [
    {
      Method: 'wallet_wagmi'
      Parameters: [string]
      ReturnType: string
    },
  ]

  const client = createClient({
    rpcSchema: rpcSchema<MockRpcSchema>(),
    transport: http(),
  })

  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.request).toEqualTypeOf<EIP1193RequestFn<MockRpcSchema>>()
})

test('https://github.com/wevm/viem/issues/1955', () => {
  createPublicClient({
    chain: optimism,
    transport: http(),
  })
})
