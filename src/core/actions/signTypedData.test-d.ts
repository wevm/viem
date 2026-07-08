import type { Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http } from 'viem'

const client = Client.create({ transport: http() })

const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const

test('returns a signature', async () => {
  const signature = await Actions.signTypedData(client, {
    types,
    primaryType: 'Mail',
    message: {
      from: { name: 'Cow', wallet: '0x' },
      to: { name: 'Bob', wallet: '0x' },
      contents: 'Hello, Bob!',
    },
  })
  expectTypeOf(signature).toEqualTypeOf<Hex.Hex>()
})

test('rejects an invalid primaryType', async () => {
  await Actions.signTypedData(client, {
    types,
    // @ts-expect-error not a valid primaryType
    primaryType: 'NotAType',
    message: {
      from: { name: 'Cow', wallet: '0x' },
      to: { name: 'Bob', wallet: '0x' },
      contents: 'Hello, Bob!',
    },
  })
})
