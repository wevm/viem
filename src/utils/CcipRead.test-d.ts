import type { Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'
import { CcipRead } from 'viem/utils'

const sender = '0x0000000000000000000000000000000000000000'

test('request: public types', () => {
  expectTypeOf(CcipRead.request)
    .parameter(0)
    .toEqualTypeOf<CcipRead.request.Options>()
  expectTypeOf(
    CcipRead.request,
  ).returns.resolves.toEqualTypeOf<CcipRead.request.ReturnType>()
  expectTypeOf<CcipRead.request.ReturnType>().toEqualTypeOf<Hex.Hex>()
  expectTypeOf<CcipRead.request.ErrorType>().toMatchTypeOf<Error>()
  expectTypeOf<CcipRead.UrlNotAllowedError>().toMatchTypeOf<CcipRead.request.ErrorType>()
})

test('request: accepts readonly urls, requestOptions, and unsafe opt-in', () => {
  expectTypeOf<CcipRead.request.Options['allowUnsafeUrls']>().toEqualTypeOf<
    boolean | undefined
  >()
  expectTypeOf<CcipRead.request.Options['urls']>().toEqualTypeOf<
    readonly string[]
  >()

  const options = {
    allowUnsafeUrls: true,
    data: '0xdeadbeef',
    requestOptions: { signal: new AbortController().signal },
    sender,
    urls: ['https://example.com/{sender}/{data}'] as const,
  } satisfies CcipRead.request.Options

  expectTypeOf(options.allowUnsafeUrls).toEqualTypeOf<true>()
  expectTypeOf(options.requestOptions.signal).toEqualTypeOf<AbortSignal>()
})

test('tunnel: returns a client-compatible request', () => {
  expectTypeOf<CcipRead.tunnel.Options['batchGateways']>().toEqualTypeOf<
    readonly string[]
  >()

  const tunnel = CcipRead.tunnel({
    batchGateways: ['https://ccip-v3.ens.xyz'] as const,
  })

  expectTypeOf(tunnel).toEqualTypeOf<CcipRead.tunnel.ReturnType>()
  expectTypeOf(tunnel.request).toEqualTypeOf<CcipRead.Request>()
  expectTypeOf(tunnel).toMatchTypeOf<Client.CcipReadOptions>()

  Client.create({ ccipRead: tunnel, transport: http() })
})

test('Client: contextually types requestOptions', () => {
  Client.create({
    ccipRead: {
      async request({ requestOptions }) {
        expectTypeOf(requestOptions).toEqualTypeOf<
          CcipRead.request.Options['requestOptions']
        >()
        return '0xdeadbeef'
      },
    },
    transport: http(),
  })
})

test('Client: requires a CCIP request implementation', () => {
  Client.create({
    // @ts-expect-error `request` is required when CCIP Read is enabled.
    ccipRead: {},
    transport: http(),
  })
})
