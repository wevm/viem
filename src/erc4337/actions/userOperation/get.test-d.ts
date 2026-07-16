import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'
import { get } from './get.js'

const client = Client.create({ transport: http() })

test('default', async () => {
  const result = await get(client, { hash: '0x' })
  expectTypeOf(result).toEqualTypeOf<get.ReturnType>()
})

test('entryPointVersion', async () => {
  const result = await get<'0.7'>(client, { hash: '0x' })
  expectTypeOf(result).toEqualTypeOf<get.ReturnType<'0.7'>>()
})
