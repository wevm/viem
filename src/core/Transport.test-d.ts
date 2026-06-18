import { expectTypeOf, test } from 'vitest'

import * as Transport from './Transport.js'
import { custom } from './transports/custom.js'
import { fallback } from './transports/fallback.js'
import { http } from './transports/http.js'

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
