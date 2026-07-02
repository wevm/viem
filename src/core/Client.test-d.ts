import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import * as constants from '~test/constants.js'
import { mainnet } from '../chains/definitions/mainnet.js'
import { Account, Client, http, Token } from 'viem'

const { address, privateKey } = constants.accounts[0]

test('request: typed against the default schema', async () => {
  const client = Client.create({ transport: http() })
  const result = await client.request({ method: 'eth_chainId' })
  expectTypeOf(result).toEqualTypeOf<`0x${string}`>()
})

test('request: typed against a zod-backed schema', async () => {
  const schema = z.RpcSchema.from({
    abe_foo: { params: z.tuple([z.number()]), returns: z.string() },
  })
  const client = Client.create({ transport: http(), schema })
  const result = await client.request({ method: 'abe_foo', params: [1] })
  expectTypeOf(result).toEqualTypeOf<string>()
})

test('account: an address coerces to a json-rpc account', () => {
  const client = Client.create({
    account: address,
    transport: http(),
  })
  expectTypeOf(client.account).toEqualTypeOf<Account.JsonRpc<typeof address>>()
})

test('account: a local account is preserved', () => {
  const account = Account.fromPrivateKey(privateKey)
  const client = Client.create({ account, transport: http() })
  expectTypeOf(client.account).toEqualTypeOf<typeof account>()
})

test('account: omitted account is undefined', () => {
  const client = Client.create({ transport: http() })
  expectTypeOf(client.account).toEqualTypeOf<undefined>()
})

test('chain: inferred from the chain option', () => {
  const client = Client.create({ chain: mainnet, transport: http() })
  expectTypeOf(client.chain).toEqualTypeOf<typeof mainnet>()
})

test('tokens: inferred from the tokens option', () => {
  const usdc = Token.from({
    addresses: { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    decimals: 6,
    symbol: 'USDC',
  })
  const client = Client.create({ tokens: [usdc], transport: http() })
  expectTypeOf(client.tokens).toEqualTypeOf<readonly [typeof usdc]>()
})

test('tokens: omitted tokens is undefined', () => {
  const client = Client.create({ transport: http() })
  expectTypeOf(client.tokens).toEqualTypeOf<undefined>()
})

test('extend: accumulates the returned bag', () => {
  const client = Client.create({ transport: http() })
    .extend(() => ({ foo: () => 'foo' as const }))
    .extend(() => ({ bar: () => 'bar' as const }))
  expectTypeOf(client.foo).toEqualTypeOf<() => 'foo'>()
  expectTypeOf(client.bar).toEqualTypeOf<() => 'bar'>()
})

test('extend: cannot redefine base keys', () => {
  Client.create({ transport: http() }).extend(() => ({
    // @ts-expect-error base key cannot be redefined
    key: 'clobbered',
  }))
})
