import {
  createClient,
  createClientResolver,
  type EIP1193RequestOptions,
  http,
} from 'viem'
import { tempo, tempoModerato } from 'viem/chains'
import { Relay } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('handleRequest contextually types plugins and downstream handlers', () => {
  const handle = Relay.handleRequest(
    async (request, options) => {
      expectTypeOf(request).toEqualTypeOf<Relay.handleRequest.Request>()
      expectTypeOf(options?.chainId).toEqualTypeOf<number | undefined>()
      expectTypeOf(options).toExtend<EIP1193RequestOptions | undefined>()
      return '0x1069'
    },
    {
      plugins: [
        (next) => (request, options) => {
          expectTypeOf(next).toEqualTypeOf<Relay.handleRequest.Handler>()
          expectTypeOf(request.params).toEqualTypeOf<
            readonly unknown[] | undefined
          >()
          expectTypeOf(options).toEqualTypeOf<
            Relay.handleRequest.RequestOptions | undefined
          >()
          return next(request, options)
        },
      ],
    },
  )

  expectTypeOf(handle).toEqualTypeOf<Relay.handleRequest.Handler>()
  expectTypeOf(handle).toEqualTypeOf<
    (
      request: { method: string; params?: readonly unknown[] | undefined },
      options?:
        | (EIP1193RequestOptions & { chainId?: number | undefined })
        | undefined,
    ) => Promise<unknown>
  >()
  expectTypeOf(handle({ method: 'eth_chainId' })).toEqualTypeOf<
    Promise<unknown>
  >()
})

test('handleRequest accepts readonly plugins and exact optional properties', () => {
  const plugins = [(next) => next] as const satisfies readonly Relay.Plugin[]
  const handle = Relay.handleRequest(async () => null, { plugins })
  Relay.handleRequest(handle, { plugins: undefined })
  handle(
    { method: 'eth_chainId', params: undefined },
    { chainId: undefined, retryCount: 0 },
  )

  // @ts-expect-error Plugins must return a request handler.
  Relay.handleRequest(handle, { plugins: [() => Promise.resolve(null)] })
  // @ts-expect-error Chain IDs are numbers.
  handle({ method: 'eth_chainId' }, { chainId: '0x1069' })
})

test('create infers client and resolver chains', () => {
  const client = createClient({ chain: tempo, transport: http() })
  const relay = Relay.create({ client })
  expectTypeOf(relay).toEqualTypeOf<Relay.create.ReturnType<typeof tempo.id>>()
  relay.request({ method: 'eth_chainId' })
  relay.fetch(new Request('https://relay.example'))
  // @ts-expect-error The single client has a different chain.
  relay.request({ method: 'eth_chainId' }, { chainId: tempoModerato.id })
  const resolver = createClientResolver({
    chains: [tempo, tempoModerato],
    transport: () => http(),
  })
  const multichain = Relay.create({ getClient: resolver.getClient })
  expectTypeOf(multichain).toEqualTypeOf<
    Relay.create.ReturnType<typeof tempo.id | typeof tempoModerato.id>
  >()
  multichain.request({ method: 'eth_chainId' }, { chainId: tempoModerato.id })
  // @ts-expect-error The resolver does not configure this chain.
  multichain.fetch(new Request('https://relay.example'), { chainId: 1 })
  // @ts-expect-error Client selection is required.
  Relay.create({})
  // @ts-expect-error Only one client selection strategy is allowed.
  Relay.create({ client, getClient: resolver.getClient })
  // @ts-expect-error Single clients must have a configured chain.
  Relay.create({ client: createClient({ transport: http() }) })
})

test('create contextually types inline client resolvers', () => {
  const relay = Relay.create({
    getClient({ chainId }) {
      expectTypeOf(chainId).toEqualTypeOf<number>()
      return createClient({ chain: tempo, transport: http() })
    },
  })
  expectTypeOf(relay).toEqualTypeOf<Relay.create.ReturnType<number>>()
})

test('transaction plugins expose typed policies and caches', () => {
  const plugins: readonly Relay.Plugin[] = [
    Relay.autoSwap({ slippage: 0.02 }),
    Relay.feeToken({
      resolveTokens: (chainId) => {
        expectTypeOf(chainId).toEqualTypeOf<number>()
        return []
      },
    }),
    Relay.simulate(),
    Relay.feePayer({
      validate(transaction) {
        expectTypeOf(transaction.from).toEqualTypeOf<
          `0x${string}` | undefined
        >()
        return 'spend_limit_exceeded'
      },
      onSponsored(event) {
        expectTypeOf(event).toEqualTypeOf<Relay.feePayer.SponsoredEvent>()
        return { subsidized: false }
      },
    }),
  ]
  Relay.handleRequest(async () => null, { plugins })
  // @ts-expect-error Slippage is a numeric fraction.
  Relay.autoSwap({ slippage: '5%' })
  // @ts-expect-error A policy must return a supported verdict.
  Relay.feePayer({ validate: () => 'allow' })
  // @ts-expect-error Tokens must be addresses.
  Relay.feeToken({ resolveTokens: () => ['pathUSD'] })
})
