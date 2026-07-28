import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import * as constants from '~test/constants.js'
import { mainnet } from '../chains/definitions/mainnet.js'
import { optimism } from '../chains/definitions/optimism.js'
import { Account, Chain, Client, http, Token, webSocket } from 'viem'
import {
  type ClientV2,
  type PublicClientV2,
  type TransportV2,
  createClientV2,
  httpV2,
  mainnetV2,
  privateKeyToAccountV2,
  publicActionsV2,
} from '../../environments/v2/index.js'

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

test('chain: a chain id coerces to a chain', () => {
  const client = Client.create({ chain: 1, transport: http() })
  expectTypeOf(client.chain.id).toEqualTypeOf<1>()
  expectTypeOf(client.chain).toMatchTypeOf<Chain.Chain>()
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

test('extend: a `~schema` marker widens the request schema', async () => {
  type Extension = {
    '~schema'?:
      | {
          Request: { method: 'abe_foo'; params: [id: number] }
          ReturnType: string
        }
      | undefined
    foo: () => 'foo'
  }
  const client = Client.create({ transport: http() }).extend(
    (): Extension => ({ foo: () => 'foo' }),
  )

  const result = await client.request({ method: 'abe_foo', params: [1] })
  expectTypeOf(result).toEqualTypeOf<string>()
  expectTypeOf(client.foo).toEqualTypeOf<() => 'foo'>()
  expectTypeOf<
    '~schema' extends keyof typeof client ? true : false
  >().toEqualTypeOf<false>()
})

test('createResolver: narrows chain and transport from a map', () => {
  const mainnetTransport = http()
  const optimismTransport = webSocket()
  const resolver = Client.createResolver({
    chains: [mainnet, optimism],
    transport: {
      [mainnet.id]: mainnetTransport,
      [optimism.id]: optimismTransport,
    },
  })

  const mainnetClient = resolver.getClient({ chainId: mainnet.id })
  expectTypeOf(mainnetClient.chain).toEqualTypeOf<typeof mainnet>()
  expectTypeOf(mainnetClient.transport).toEqualTypeOf<
    ReturnType<typeof mainnetTransport.setup>
  >()

  const optimismClient = resolver.getClient({ chainId: optimism.id })
  expectTypeOf(optimismClient.chain).toEqualTypeOf<typeof optimism>()
  expectTypeOf(optimismClient.transport).toEqualTypeOf<
    ReturnType<typeof optimismTransport.setup>
  >()

  const chainId = mainnet.id as typeof mainnet.id | typeof optimism.id
  const client = resolver.getClient({ chainId })
  expectTypeOf(client.chain).toEqualTypeOf<typeof mainnet | typeof optimism>()
  expectTypeOf(client.transport).toEqualTypeOf<
    | ReturnType<typeof mainnetTransport.setup>
    | ReturnType<typeof optimismTransport.setup>
  >()

  // @ts-expect-error chain is not configured
  resolver.getClient({ chainId: 8453 })
})

test('createResolver: types a transport callback', () => {
  const mainnetTransport = http()
  const optimismTransport = webSocket()
  const resolver = Client.createResolver({
    chains: [mainnet, optimism],
    transport: ({ chainId }) => {
      expectTypeOf(chainId).toEqualTypeOf<1 | 10>()
      return chainId === mainnet.id ? mainnetTransport : optimismTransport
    },
  })

  const client = resolver.getClient({ chainId: optimism.id })
  expectTypeOf(client.chain).toEqualTypeOf<typeof optimism>()
  expectTypeOf(client.transport).toEqualTypeOf<
    | ReturnType<typeof mainnetTransport.setup>
    | ReturnType<typeof optimismTransport.setup>
  >()
})

test('createResolver: requires a transport for every chain', () => {
  Client.createResolver({
    chains: [mainnet, optimism],
    // @ts-expect-error transport is missing for Optimism
    transport: {
      [mainnet.id]: http(),
    },
  })
})

test('createResolver: rejects a shared transport', () => {
  Client.createResolver({
    chains: [mainnet, optimism],
    // @ts-expect-error transport must be indexed or resolved by chain ID
    transport: http(),
  })
})

test('createResolver: requires at least one chain', () => {
  Client.createResolver({
    // @ts-expect-error chains must be non-empty
    chains: [],
    transport: () => http(),
  })
})

test('createResolver: preserves shared Client options', async () => {
  const schema = z.RpcSchema.from({
    abe_foo: { params: z.tuple([z.number()]), returns: z.string() },
  })
  const usdc = Token.from({
    addresses: { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    decimals: 6,
    symbol: 'USDC',
  })
  const resolver = Client.createResolver({
    account: address,
    chains: [mainnet],
    schema,
    tokens: [usdc],
    transport: { [mainnet.id]: http() },
  })

  const client = resolver.getClient({ chainId: mainnet.id })
  expectTypeOf(client.account).toEqualTypeOf<Account.JsonRpc<typeof address>>()
  expectTypeOf(client.tokens).toEqualTypeOf<readonly [typeof usdc]>()
  const result = await client.request({ method: 'abe_foo', params: [1] })
  expectTypeOf(result).toEqualTypeOf<string>()
})

test('createResolver.ReturnType: defaults to a broad chain', () => {
  const resolver = {} as Client.createResolver.ReturnType
  const client = resolver.getClient({ chainId: 1 })
  expectTypeOf(client.chain).toEqualTypeOf<Chain.Chain>()
})

test('fromV2: infers the safe v3 defaults', () => {
  const source = createClientV2({
    account: address,
    chain: mainnetV2,
    transport: httpV2(),
  })
  const client = Client.fromV2(source)

  expectTypeOf(client.account).toEqualTypeOf<Account.JsonRpc<typeof address>>()
  expectTypeOf(client.chain.id).toEqualTypeOf<1>()
})

test('fromV2: preserves v3 Chain and Account overrides', () => {
  const account = Account.fromPrivateKey(privateKey)
  const source = Client.toV2(Client.create({ transport: http() }))
  const client = Client.fromV2(source, { account, chain: mainnet })

  expectTypeOf(client.account).toEqualTypeOf<typeof account>()
  expectTypeOf(client.chain).toEqualTypeOf<typeof mainnet>()
})

test('toV2: returns a chainless base Client by default', () => {
  const client = Client.toV2(
    Client.create({ account: address, chain: mainnet, transport: http() }),
  )

  expectTypeOf(client.account).toEqualTypeOf<{
    address: typeof address
    type: 'json-rpc'
  }>()
  expectTypeOf(client.chain).toEqualTypeOf<undefined>()
})

test('toV2: does not preserve local Accounts or v3 extensions', () => {
  const source = Client.create({
    account: Account.fromPrivateKey(privateKey),
    transport: http(),
  }).extend(() => ({ foo: () => 'foo' as const }))
  const client = Client.toV2(source)

  expectTypeOf(client.account).toEqualTypeOf<undefined>()
  expectTypeOf<
    'foo' extends keyof typeof client ? true : false
  >().toEqualTypeOf<false>()
})

test('toV2: preserves v2 Chain and Account overrides', () => {
  const account = { address, type: 'json-rpc' } as const
  const client = Client.toV2(Client.create({ transport: http() }), {
    account,
    chain: mainnetV2,
  })

  expectTypeOf(client.account).toEqualTypeOf<typeof account>()
  expectTypeOf(client.chain).toEqualTypeOf<typeof mainnetV2>()
})

test('toV2: accepts a complete v2 local Account override', () => {
  const account = privateKeyToAccountV2(privateKey)
  const client = Client.toV2(Client.create({ transport: http() }), { account })

  expectTypeOf(client.account).toEqualTypeOf<typeof account>()
  expectTypeOf(client).toMatchTypeOf<
    ClientV2<TransportV2, undefined, typeof account>
  >()
})

test('toV2: rejects an incomplete v2 local Account override', () => {
  Client.toV2(Client.create({ transport: http() }), {
    // @ts-expect-error local Accounts require the v2 signing interface
    account: { address, type: 'local' },
  })
})

test('toV2: accumulates v2-style extensions', () => {
  const client = Client.toV2(Client.create({ transport: http() }))
    .extend(() => ({ foo: () => 'foo' as const }))
    .extend(() => ({ bar: () => 'bar' as const }))

  expectTypeOf(client.foo).toEqualTypeOf<() => 'foo'>()
  expectTypeOf(client.bar).toEqualTypeOf<() => 'bar'>()
})

test('toV2: cannot redefine base keys', () => {
  Client.toV2(Client.create({ transport: http() })).extend(() => ({
    // @ts-expect-error base key cannot be redefined
    key: 'clobbered',
  }))
})

test('v2 compatibility: adapts base and Public Clients', async () => {
  const clientV3 = Client.create({ transport: http() })
  const clientV2 = Client.toV2(clientV3)
  const publicClientV2 = clientV2.extend(publicActionsV2)

  expectTypeOf(clientV2).toMatchTypeOf<
    ClientV2<TransportV2, undefined, undefined>
  >()
  expectTypeOf(publicClientV2).toMatchTypeOf<
    PublicClientV2<TransportV2, undefined, undefined>
  >()
  expectTypeOf(await publicClientV2.getBlockNumber()).toEqualTypeOf<bigint>()
})

test('v2 compatibility: uses v2 protected-action constraints', () => {
  const clientV2: ClientV2<TransportV2, undefined, undefined> = Client.toV2(
    Client.create({ transport: http() }),
  )

  clientV2.extend(() => ({
    // @ts-expect-error return type is incompatible with the v2 action
    getBlockNumber: async () => 'wrong',
  }))
})

test('v2 compatibility: accepts a v2 Client', () => {
  const clientV2: ClientV2 = createClientV2({ transport: httpV2() })
  const clientV3: Client.Client = Client.fromV2(clientV2)

  expectTypeOf(clientV3).toMatchTypeOf<Client.Client>()
})
