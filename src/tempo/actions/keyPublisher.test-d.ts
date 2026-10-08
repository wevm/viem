import type { Address } from 'abitype'
import type { Hex } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions,
  createClient,
  http,
  type Transaction,
} from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const account = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const client = createClient({
  account,
  chain: tempoLocalnet,
  transport: http(),
})

test('createSync returns the created publisher', async () => {
  const result = await client.keyPublisher.createSync({ keys: [], salt: '0x' })

  expectTypeOf(result).toEqualTypeOf<{
    creator: Address
    owner: Address
    publisherId: Hex
    receipt: Transaction.TransactionReceipt
  }>()
  expectTypeOf(
    Actions.keyPublisher.createSync(client, {
      initialOwner: account.address,
      keys: [{ issuer: '0x', keyHashes: ['0x'] }],
      salt: '0x',
    }),
  ).resolves.toEqualTypeOf<typeof result>()
})

test('reads return decoded values', async () => {
  const parameters = { issuer: '0x', keyHash: '0x', publisherId: '0x' } as const

  expectTypeOf(
    await client.keyPublisher.getActiveKeys(parameters),
  ).toEqualTypeOf<readonly Hex[]>()
  expectTypeOf(
    await client.keyPublisher.getKeyValidUntil(parameters),
  ).toEqualTypeOf<bigint>()
  expectTypeOf(
    await client.keyPublisher.getOwner(parameters),
  ).toEqualTypeOf<Address>()
  expectTypeOf(
    await client.keyPublisher.isKeyActive(parameters),
  ).toEqualTypeOf<boolean>()
})

test('setKeysSync returns the replaced key list', async () => {
  const { graceUntil, keyHashes } = await client.keyPublisher.setKeysSync({
    issuer: '0x',
    keyHashes: [],
    publisherId: '0x',
  })

  expectTypeOf(graceUntil).toEqualTypeOf<bigint>()
  expectTypeOf(keyHashes).toEqualTypeOf<readonly Hex[]>()
})

test('watchKeysSet narrows event arguments', () => {
  client.keyPublisher.watchKeysSet({
    args: { publisherId: '0x' },
    onKeysSet(args) {
      expectTypeOf(args.graceUntil).toEqualTypeOf<bigint>()
      expectTypeOf(args.issuer).toEqualTypeOf<Hex>()
      expectTypeOf(args.keyHashes).toEqualTypeOf<readonly Hex[]>()
      expectTypeOf(args.publisherId).toEqualTypeOf<Hex>()
    },
  })
})
