import { expectTypeOf, test } from 'vitest'

import { custom, fallback, http, Transport, webSocket } from 'viem'

const transport = http('https://example.com').setup({})

test('request: result typed from its method', () => {
  expectTypeOf(
    transport.request({ method: 'eth_chainId' }),
  ).resolves.toEqualTypeOf<`0x${string}`>()
})

test('request: non-schema method falls back to unknown', () => {
  expectTypeOf(transport.request({ method: 'foo_bar' })).resolves.toBeUnknown()
})

test('from: infers type + properties from setup return', () => {
  expectTypeOf(http('https://example.com')).toEqualTypeOf<
    Transport.Transport<'http', { url: string }>
  >()

  expectTypeOf(custom({ request: async () => null })).toEqualTypeOf<
    Transport.Transport<'custom'>
  >()

  expectTypeOf(http('https://example.com').setup({}).url).toBeString()

  const instance = fallback([http('https://example.com')]).setup({})
  expectTypeOf(instance.transports).toEqualTypeOf<
    readonly Transport.Instance[]
  >()
  expectTypeOf(instance.onResponse).parameter(0).toBeFunction()
})

test('webSocket: exposes getRpcClient + subscribe properties', () => {
  expectTypeOf(webSocket('wss://example.com').type).toEqualTypeOf<'webSocket'>()

  const instance = webSocket('wss://example.com').setup({})
  expectTypeOf(instance.getRpcClient).toBeFunction()
  expectTypeOf(instance.subscribe).toBeFunction()
  expectTypeOf(instance.subscribe).returns.resolves.toMatchTypeOf<{
    subscriptionId: `0x${string}`
    onData: (listener: (data: unknown) => void) => void
    onError: (listener: (error: Error | Event) => void) => void
    unsubscribe: () => Promise<unknown>
  }>()
})
