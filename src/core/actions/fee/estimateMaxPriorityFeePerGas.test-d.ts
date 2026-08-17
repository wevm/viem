import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http } from 'viem'
const client = Client.create({ transport: http() })

test('default: returns a bigint', async () => {
  const maxPriorityFeePerGas =
    await Actions.fee.estimateMaxPriorityFeePerGas(client)
  expectTypeOf(maxPriorityFeePerGas).toEqualTypeOf<bigint>()
})

test('options are optional', async () => {
  await Actions.fee.estimateMaxPriorityFeePerGas(client, {})
})
