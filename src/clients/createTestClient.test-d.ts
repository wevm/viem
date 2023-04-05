import { localhost } from '@wagmi/chains'
import { expectTypeOf, test } from 'vitest'

import type { TestClient } from './createTestClient'
import { createTestClient } from './createTestClient'
import { http } from './transports'

test('with chain', () => {
  const client = createTestClient({
    chain: localhost,
    mode: 'anvil',
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<TestClient>()
  expectTypeOf(client.mode).toEqualTypeOf<'anvil'>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createTestClient({
    mode: 'anvil',
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<TestClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})
