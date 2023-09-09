import { expectTypeOf, test } from 'vitest'

import { localhost } from '../chains/index.js'
import { type PublicClient, createPublicClient } from './createPublicClient.js'
import { http } from './transports/http.js'

test('with chain', () => {
  const client = createPublicClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createPublicClient({ transport: http() })
  expectTypeOf(client).toMatchTypeOf<PublicClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})
