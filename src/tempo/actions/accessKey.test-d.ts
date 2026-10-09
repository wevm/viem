import type { KeyAuthorization } from 'ox/tempo'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  type AccountOperation,
  Actions,
  createClient,
  http,
  Relay,
  Store,
  withRelay,
} from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const configurable = Account.fromConfigurable({
  address: 'infer',
  owners: [owner],
})
const accessKey = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000002',
  { access: configurable },
)
const client = createClient({
  chain: tempoLocalnet,
  transport: withRelay(http(), {
    plugins: [Relay.accounts({ store: Store.memory() })],
  }),
})

test('behavior: infers a local key authorization', async () => {
  const authorization = await client.accessKey.signAuthorization({
    accessKey,
    account: configurable,
  })

  expectTypeOf(authorization).toEqualTypeOf<KeyAuthorization.Signed>()
})

test('behavior: infers coordinated key authorizations', async () => {
  const pending = await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: configurable,
    owner,
  })
  const success = await client.accessKey.signAuthorization({
    hash: pending.hash,
    owner,
  })

  expectTypeOf(pending).toMatchTypeOf<KeyAuthorization.Signed>()
  expectTypeOf(pending.hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(
    pending.operation,
  ).toEqualTypeOf<AccountOperation.KeyAuthorizationOperation>()
  expectTypeOf(pending.status).toEqualTypeOf<'pending' | 'success'>()
  expectTypeOf(success).toMatchTypeOf<KeyAuthorization.Signed>()
  expectTypeOf(success.hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(
    success.operation,
  ).toEqualTypeOf<AccountOperation.KeyAuthorizationOperation>()
  expectTypeOf(success.status).toEqualTypeOf<'pending' | 'success'>()
})

test('behavior: rejects mixed initial and continuation parameters', async () => {
  await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: configurable,
    // @ts-expect-error `accessKey` and `hash` belong to different modes.
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    owner,
  })
})

test('behavior: rejects address owners', async () => {
  await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: configurable,
    // @ts-expect-error Coordinated approvals require a local signing account.
    owner: owner.address,
  })
})

test('behavior: rejects non-root coordinated owners', async () => {
  await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: configurable,
    // @ts-expect-error Nested owners are unsupported.
    owner: configurable,
  })
  // @ts-expect-error Nested owners are unsupported.
  await client.accessKey.signAuthorization({ hash: '0x', owner: configurable })
  await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: configurable,
    // @ts-expect-error Access-key owners are unsupported.
    owner: accessKey,
  })
  // @ts-expect-error Access-key owners are unsupported.
  await client.accessKey.signAuthorization({ hash: '0x', owner: accessKey })
})
