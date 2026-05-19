import { describe, expectTypeOf, test } from 'vp/test'
import type * as RpcSchema from 'ox/RpcSchema'

import { Transport, custom, fallback, http, webSocket } from '../index.js'
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

  test('types: exposes flat factory namespaces', () => {
    expectTypeOf(http).toExtend<
      (url?: string, options?: http.Options) => http.Transport
    >()
    expectTypeOf(custom).toExtend<
      (provider: custom.Provider, options?: custom.Options) => custom.Transport
    >()
    expectTypeOf(webSocket).toExtend<
      (url?: string, options?: webSocket.Options) => webSocket.Transport
    >()
    expectTypeOf(fallback).toExtend<
      (
        transports: readonly Transport.Transport[],
        options?: fallback.Options,
      ) => fallback.Transport<readonly Transport.Transport[]>
    >()
  })

  test('types: accepts custom rpc schemas on http transports', async () => {
    type Schema = RpcSchema.From<{
      Request: {
        method: 'test_echo'
        params: [value: string]
      }
      ReturnType: string
    }>

    const transport = http<Schema>('https://example.com')({})
    const result = transport.request({
      method: 'test_echo',
      params: ['hello'],
    })

    expectTypeOf(result).toEqualTypeOf<Promise<string>>()

    transport.request({
      method: 'test_echo',
      // @ts-expect-error - params are inferred from the schema.
      params: [123],
    })
  })
})
