import type { UserOperationReceipt } from 'ox/erc4337'
import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'
import { waitForReceipt } from './waitForReceipt.js'

const client = Client.create({ transport: http() })

test('default', async () => {
  const receipt = await waitForReceipt(client, { hash: '0x' })
  expectTypeOf(
    receipt,
  ).toEqualTypeOf<UserOperationReceipt.UserOperationReceipt>()
})

test('entryPointVersion', async () => {
  const receipt = await waitForReceipt<'0.7'>(client, { hash: '0x' })
  expectTypeOf(receipt).toEqualTypeOf<
    UserOperationReceipt.UserOperationReceipt<'0.7'>
  >()
})
