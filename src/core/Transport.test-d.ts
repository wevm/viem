import { expectTypeOf, test } from 'vitest'

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
