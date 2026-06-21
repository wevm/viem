import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'

import { estimateMaxPriorityFeePerGas } from './estimateMaxPriorityFeePerGas.js'

const client = Client.create({ transport: http() })

test('default: returns a bigint', async () => {
  const maxPriorityFeePerGas = await estimateMaxPriorityFeePerGas(client)
  expectTypeOf(maxPriorityFeePerGas).toEqualTypeOf<bigint>()
})

test('options are optional', async () => {
  await estimateMaxPriorityFeePerGas(client, {})
})
