import type { Address } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'
import { getSupported } from './getSupported.js'

const client = Client.create({ transport: http() })

test('return type', async () => {
  const entryPoints = await getSupported(client)
  expectTypeOf(entryPoints).toEqualTypeOf<readonly Address.Address[]>()
})
