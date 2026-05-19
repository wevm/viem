import { describe, expectTypeOf, test } from 'vp/test'

import { Transport } from '../index.js'
import * as TransportSubpath from 'viem/Transport'

describe('Transport', () => {
  test('types: is exposed from the root and subpath entrypoints', () => {
    expectTypeOf(Transport.create).toEqualTypeOf<
      typeof TransportSubpath.create
    >()
    expectTypeOf(Transport.shouldThrow).toEqualTypeOf<
      typeof TransportSubpath.shouldThrow
    >()
    expectTypeOf<Transport.Transport>().toEqualTypeOf<TransportSubpath.Transport>()

    // @ts-expect-error - transport factories stay flat at the root.
    expectTypeOf(Transport.http).toBeNever()
  })

  test('types: creates concrete transport instances', () => {
    const transport = Transport.create({
      key: 'mock',
      name: 'Mock',
      async request() {
        return '0x1'
      },
      type: 'mock',
    })

    expectTypeOf(transport).toExtend<Transport.Instance<'mock'>>()
    expectTypeOf(transport.config.type).toEqualTypeOf<'mock'>()
  })
})
