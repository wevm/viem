import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({ chain: mainnet, transport: http() })
const blockHash =
  '0x0000000000000000000000000000000000000000000000000000000000000001'
const options = {
  address: '0x0000000000000000000000000000000000000001',
  hash: blockHash,
  signature: '0x',
} as const

test('block hash context', () => {
  expectTypeOf(
    Actions.verifyHash(client, {
      ...options,
      blockHash,
      requireCanonical: true,
    }),
  ).toEqualTypeOf<Promise<boolean>>()

  // @ts-expect-error requireCanonical requires blockHash
  Actions.verifyHash(client, { ...options, requireCanonical: true })

  // @ts-expect-error blockHash and blockNumber are mutually exclusive
  Actions.verifyHash(client, { ...options, blockHash, blockNumber: 1n })

  // @ts-expect-error blockHash and blockTag are mutually exclusive
  Actions.verifyHash(client, { ...options, blockHash, blockTag: 'latest' })
})
