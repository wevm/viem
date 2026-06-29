import type { Address } from 'abitype'
import { describe, expectTypeOf, test } from 'vitest'

import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import type { Account, JsonRpcAccount } from '../accounts/types.js'
import { getBalance } from '../actions/token/getBalance.js'
import { localhost, mainnet, optimism } from '../chains/index.js'
import {
  createPublicClient,
  type EIP1193RequestFn,
  publicActions,
} from '../index.js'
import { usdc, usdce } from '../tokens/index.js'
import type { Chain } from '../types/chain.js'
import { type Client, createClient, rpcSchema } from './createClient.js'
import { walletActions } from './decorators/wallet.js'
import { http } from './transports/http.js'

const account = privateKeyToAccount(`0x${'1'.repeat(64)}`)

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

describe('tokens', () => {
  test('standalone: infers token symbols from client tokens', () => {
    const client = createClient({
      account,
      chain: mainnet,
      tokens: [usdc, usdce],
      transport: http(),
    })

    getBalance(client, { token: 'usdc' })
    getBalance(client, { token: '0x' })

    // @ts-expect-error USDC.e has no mainnet address.
    getBalance(client, { token: 'usdc.e' })
    // @ts-expect-error unknown name.
    getBalance(client, { token: 'nope' })
  })

  test('decorated client: keeps token-symbol inference', () => {
    const client = createClient({
      account,
      chain: mainnet,
      tokens: [usdc, usdce],
      transport: http(),
    }).extend(publicActions)

    client.token.getBalance({ token: 'usdc' })
    // @ts-expect-error USDC.e has no mainnet address.
    client.token.getBalance({ token: 'usdc.e' })
  })

  test('no tokens: only address allowed', () => {
    const client = createClient({ account, chain: mainnet, transport: http() })
    getBalance(client, { token: '0x' })
    // @ts-expect-error no tokens declared.
    getBalance(client, { token: 'usdc' })
    expectTypeOf(client.tokens).toEqualTypeOf<undefined>()
  })
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
