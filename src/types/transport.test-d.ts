import { expectTypeOf, test } from 'vitest'

import { fallback } from '../clients/transports/fallback.js'
import { http } from '../clients/transports/http.js'
import { webSocket } from '../clients/transports/webSocket.js'
import type { HasTransportType } from './transport.js'

test('HasTransportType', () => {
  {
    const transport = webSocket()
    expectTypeOf<
      HasTransportType<typeof transport, 'http'>
    >().toEqualTypeOf<false>()
    expectTypeOf<
      HasTransportType<typeof transport, 'webSocket'>
    >().toEqualTypeOf<true>()
  }
  {
    const transport = http()
    expectTypeOf<
      HasTransportType<typeof transport, 'http'>
    >().toEqualTypeOf<true>()
    expectTypeOf<
      HasTransportType<typeof transport, 'webSocket'>
    >().toEqualTypeOf<false>()
  }
  {
    const transport = fallback([http(), webSocket()])
    expectTypeOf<
      HasTransportType<typeof transport, 'http'>
    >().toEqualTypeOf<true>()
    expectTypeOf<
      HasTransportType<typeof transport, 'webSocket'>
    >().toEqualTypeOf<true>()
  }
  {
    const transport = fallback([webSocket()])
    expectTypeOf<
      HasTransportType<typeof transport, 'http'>
    >().toEqualTypeOf<false>()
    expectTypeOf<
      HasTransportType<typeof transport, 'webSocket'>
    >().toEqualTypeOf<true>()
  }
})
