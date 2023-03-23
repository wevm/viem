import { localhost } from '@wagmi/chains'
import { expectTypeOf, test } from 'vitest'

import { createPublicClient, PublicClient } from './createPublicClient'
import { http } from './transports'

test('with chain', () => {
  const client = createPublicClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)

  const foo = (c: PublicClient) => c
  foo(client)
})

test('without chain', () => {
  const client = createPublicClient({
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})
