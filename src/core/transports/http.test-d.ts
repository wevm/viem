import type { RpcResponse } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { http, Transport } from 'viem'

test('default: request resolves the parsed result', () => {
  const instance = http('https://example.com').setup()
  expectTypeOf(
    instance.request({ method: 'eth_chainId' }),
  ).resolves.toEqualTypeOf<`0x${string}`>()

  expectTypeOf(http('https://example.com')).toEqualTypeOf<Transport.Http>()
})

test('raw: request resolves the response envelope', () => {
  const instance = http('https://example.com', { raw: true }).setup()
  expectTypeOf(
    instance.request({ method: 'eth_chainId' }),
  ).resolves.toEqualTypeOf<
    | { error?: undefined; result: `0x${string}` }
    | { error: RpcResponse.ErrorObject; result?: undefined }
  >()

  expectTypeOf(http('https://example.com', { raw: true })).toEqualTypeOf<
    Transport.Http<true>
  >()
})

test('raw: assignable to the generic Transport shape', () => {
  expectTypeOf(
    http('https://example.com', { raw: true }),
  ).toMatchTypeOf<Transport.Transport>()
})

test('instance: exposes fetchOptions and url', () => {
  const instance = http('https://example.com', {
    fetchOptions: { headers: { Authorization: 'Bearer token' } },
  }).setup()
  expectTypeOf(instance.url).toBeString()
  expectTypeOf(instance.fetchOptions).toEqualTypeOf<
    Omit<RequestInit, 'body'> | undefined
  >()
})
