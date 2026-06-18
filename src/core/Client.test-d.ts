import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { accounts } from '~test/constants.js'
import { mainnet } from '../chains/definitions/mainnet.js'
import { Account, Client, http } from 'viem'

const { address, privateKey } = accounts[0]

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
