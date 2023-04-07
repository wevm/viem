import { localhost } from '@wagmi/chains'
import { expectTypeOf, test } from 'vitest'

import type { PublicClient } from './createPublicClient.js'
import { createPublicClient } from './createPublicClient.js'
import { http } from './transports/index.js'

test('with chain', () => {
  const client = createPublicClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createPublicClient({
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})
