import { localhost } from '@wagmi/chains'
import { expectTypeOf, test } from 'vitest'

import { createClient } from './createClient'
import { http } from './transports'

test('with chain', () => {
  const client = createClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client.chain).toEqualTypeOf<typeof localhost>()
})

test('with chain', () => {
  const client = createClient({
    transport: http(),
  })
  expectTypeOf(client).not.toHaveProperty('chain')
})
