import type { KeyAuthorization } from 'ox/tempo'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions,
  createClient,
  type MultisigOperation,
} from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const multisig = Account.fromMultisig({
  address: 'infer',
  owners: [owner],
})
const accessKey = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000002',
  { access: multisig },
)
const client = createClient({
  chain: tempoLocalnet,
  experimental_multisig: true,
})

test('behavior: infers a local key authorization', async () => {
  const authorization = await client.accessKey.signAuthorization({
    accessKey,
    account: multisig,
  })

  expectTypeOf(authorization).toEqualTypeOf<KeyAuthorization.Signed>()
})

test('behavior: infers coordinated key authorizations', async () => {
  const pending = await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: multisig,
    owner,
  })
  const success = await client.accessKey.signAuthorization({
    hash: pending.hash,
    owner,
  })

  expectTypeOf(pending).toMatchTypeOf<KeyAuthorization.Signed>()
  expectTypeOf(pending.hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(
    pending.multisig,
  ).toEqualTypeOf<MultisigOperation.KeyAuthorizationOperation>()
  expectTypeOf(pending.status).toEqualTypeOf<'pending' | 'success'>()
  expectTypeOf(success).toMatchTypeOf<KeyAuthorization.Signed>()
  expectTypeOf(success.hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(
    success.multisig,
  ).toEqualTypeOf<MultisigOperation.KeyAuthorizationOperation>()
  expectTypeOf(success.status).toEqualTypeOf<'pending' | 'success'>()
})

test('behavior: rejects mixed initial and continuation parameters', async () => {
  await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: multisig,
    // @ts-expect-error `accessKey` and `hash` belong to different modes.
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    owner,
  })
})

test('behavior: rejects address owners', async () => {
  await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: multisig,
    // @ts-expect-error Coordinated approvals require a local signing account.
    owner: owner.address,
  })
})
