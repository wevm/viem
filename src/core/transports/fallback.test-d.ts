import { expectTypeOf, test } from 'vitest'

import { fallback, http, webSocket } from 'viem'

test('transports: preserves each member instance type', () => {
  const instance = fallback([
    http('https://example.com'),
    webSocket('wss://example.com'),
  ]).setup()
  const [first, second] = instance.transports
  expectTypeOf(first.url).toBeString()
  expectTypeOf(second.getRpcClient).toBeFunction()
  expectTypeOf(second.subscribe).toBeFunction()
})

test('transports: preserves raw request typing on members', () => {
  const instance = fallback([
    http('https://example.com', { raw: true }),
  ]).setup()
  const [first] = instance.transports
  expectTypeOf(
    first.request({ method: 'eth_chainId' }),
  ).resolves.toMatchTypeOf<{ error?: unknown; result?: unknown }>()
})

test('stopRank: exposed on the instance', () => {
  const instance = fallback([http('https://example.com')]).setup()
  expectTypeOf(instance.stopRank).toEqualTypeOf<() => void>()
})
