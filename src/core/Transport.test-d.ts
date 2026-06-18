import { expectTypeOf, test } from 'vitest'

import * as Transport from './Transport.js'
import * as custom from './transports/custom.js'
import * as fallback from './transports/fallback.js'
import * as http from './transports/http.js'
import * as webSocket from './transports/webSocket.js'

const transport = http.http('https://example.com').setup({})

test('request: result typed from its method', () => {
  expectTypeOf(
    transport.request({ method: 'eth_chainId' }),
  ).resolves.toEqualTypeOf<`0x${string}`>()
})

test('request: non-schema method falls back to unknown', () => {
  expectTypeOf(transport.request({ method: 'foo_bar' })).resolves.toBeUnknown()
})

test('from: infers type + properties from setup return', () => {
  expectTypeOf(http.http('https://example.com')).toEqualTypeOf<
    Transport.Transport<'http', { url: string }>
  >()

  expectTypeOf(custom.custom({ request: async () => null })).toEqualTypeOf<
    Transport.Transport<'custom'>
  >()

  expectTypeOf(http.http('https://example.com').setup({}).url).toBeString()

  const instance = fallback
    .fallback([http.http('https://example.com')])
    .setup({})
  expectTypeOf(instance.transports).toEqualTypeOf<
    readonly Transport.Instance[]
  >()
  expectTypeOf(instance.onResponse).parameter(0).toBeFunction()
})

test('webSocket: exposes getRpcClient + subscribe properties', () => {
  expectTypeOf(
    webSocket.webSocket('wss://example.com').type,
  ).toEqualTypeOf<'webSocket'>()

  const instance = webSocket.webSocket('wss://example.com').setup({})
  expectTypeOf(instance.getRpcClient).toBeFunction()
  expectTypeOf(instance.subscribe).toBeFunction()
  expectTypeOf(instance.subscribe).returns.resolves.toMatchTypeOf<{
    subscriptionId: `0x${string}`
    onData: (listener: (data: unknown) => void) => void
    onError: (listener: (error: Error | Event) => void) => void
    unsubscribe: () => Promise<unknown>
  }>()
})
