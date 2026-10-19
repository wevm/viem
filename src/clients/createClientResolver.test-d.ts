import {
  type Chain,
  type Client,
  createClientResolver,
  type HttpTransport,
  http,
  type JsonRpcAccount,
  publicActions,
  rpcSchema,
  type WebSocketTransport,
  webSocket,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, optimism } from 'viem/chains'
import { usdc, usdce } from 'viem/tokens'
import { expectTypeOf, test } from 'vitest'

test('narrows chain and transport from a map', () => {
  const resolver = createClientResolver({
    chains: [mainnet, optimism],
    transport: { [mainnet.id]: http(), [optimism.id]: webSocket() },
  })
  const client = resolver.getClient({ chainId: mainnet.id })
  expectTypeOf(client.chain).toEqualTypeOf<typeof mainnet>()
  expectTypeOf(client.transport).toEqualTypeOf<
    Client<HttpTransport>['transport']
  >()
  expectTypeOf(client.account).toEqualTypeOf<undefined>()
  expectTypeOf(client.tokens).toEqualTypeOf<undefined>()

  const other = resolver.getClient({ chainId: optimism.id })
  expectTypeOf(other.chain).toEqualTypeOf<typeof optimism>()
  expectTypeOf(other.transport).toEqualTypeOf<
    Client<WebSocketTransport>['transport']
  >()

  const chainId = mainnet.id as typeof mainnet.id | typeof optimism.id
  const union = resolver.getClient({ chainId })
  expectTypeOf(union.chain).toEqualTypeOf<typeof mainnet | typeof optimism>()
  expectTypeOf(union.transport).toEqualTypeOf<
    Client<HttpTransport | WebSocketTransport>['transport']
  >()

  // @ts-expect-error chain is not configured
  resolver.getClient({ chainId: 8453 })
  // @ts-expect-error chain ID is required
  resolver.getClient()
})

test('contextually types transport callbacks', () => {
  const resolver = createClientResolver({
    chains: [mainnet, optimism],
    transport: ({ chainId }) => {
      expectTypeOf(chainId).toEqualTypeOf<1 | 10>()
      return chainId === mainnet.id ? http() : webSocket()
    },
  })
  const client = resolver.getClient({ chainId: optimism.id })
  expectTypeOf(client.chain).toEqualTypeOf<typeof optimism>()
  expectTypeOf(client.transport).toEqualTypeOf<
    Client<HttpTransport | WebSocketTransport>['transport']
  >()
})

test('requires a nonempty chain list and exhaustive transports', () => {
  createClientResolver({
    chains: [mainnet, optimism],
    // @ts-expect-error transport is missing for Optimism
    transport: { [mainnet.id]: http() },
  })
  createClientResolver({
    chains: [mainnet, optimism],
    // @ts-expect-error a shared transport is not a resolver callback
    transport: http(),
  })
  createClientResolver({
    // @ts-expect-error chains must be nonempty
    chains: [],
    transport: () => http(),
  })
})

test('preserves shared account, tokens, and RPC schema', async () => {
  const address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  const resolver = createClientResolver({
    account: address,
    chains: [mainnet, optimism],
    rpcSchema:
      rpcSchema<
        [{ Method: 'example_echo'; Parameters: [number]; ReturnType: string }]
      >(),
    tokens: [usdc, usdce],
    transport: () => http(),
  })
  const client = resolver.getClient({ chainId: mainnet.id })
  expectTypeOf(client.account).toEqualTypeOf<JsonRpcAccount<typeof address>>()
  expectTypeOf(client.tokens).toEqualTypeOf<
    readonly [typeof usdc, typeof usdce]
  >()
  const result = await client.request({ method: 'example_echo', params: [1] })
  expectTypeOf(result).toEqualTypeOf<string>()
  // @ts-expect-error RPC parameters are preserved
  client.request({ method: 'example_echo', params: ['1'] })

  const extended = client.extend(publicActions)
  expectTypeOf(extended.chain).toEqualTypeOf<typeof mainnet>()
  extended.token.getBalance({ token: 'usdc' })
  // @ts-expect-error USDC.e has no mainnet address
  extended.token.getBalance({ token: 'usdc.e' })
})

test('preserves local accounts', () => {
  const account = privateKeyToAccount(`0x${'1'.repeat(64)}`)
  const resolver = createClientResolver({
    account,
    chains: [mainnet],
    transport: () => http(),
  })
  expectTypeOf(
    resolver.getClient({ chainId: mainnet.id }).account,
  ).toEqualTypeOf<typeof account>()
})

test('supports broad resolver types without narrowing the chain to never', () => {
  const options: createClientResolver.Options = {
    chains: [mainnet],
    transport: () => http(),
  }
  const resolver: createClientResolver.ReturnType =
    createClientResolver(options)
  expectTypeOf(resolver.getClient({ chainId: 1 }).chain).toEqualTypeOf<Chain>()
})
