import type { EIP1193RequestOptions } from 'viem'
import { type Multisig, Relay } from 'viem/tempo'
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

test('Multisig retains its shared request type aliases', () => {
  expectTypeOf<Multisig.handleRequest.Handler>().toEqualTypeOf<Relay.handleRequest.Handler>()
  expectTypeOf<Multisig.handleRequest.Request>().toEqualTypeOf<Relay.handleRequest.Request>()
  expectTypeOf<Multisig.handleRequest.RequestOptions>().toEqualTypeOf<Relay.handleRequest.RequestOptions>()
})
