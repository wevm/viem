import { describe, expectTypeOf, test } from 'vp/test'

import { Transport, custom, fallback, http, webSocket } from '../../index.js'

describe('transports', () => {
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
})
