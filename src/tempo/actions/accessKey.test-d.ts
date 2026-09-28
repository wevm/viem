import type { FundingPolicy, KeyAuthorization } from 'ox/tempo'
import type { Account as ViemAccount } from 'viem'
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

test('behavior: rejects non-root coordinated owners', async () => {
  await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: multisig,
    // @ts-expect-error Nested multisig owners are unsupported.
    owner: multisig,
  })
  // @ts-expect-error Nested multisig owners are unsupported.
  await client.accessKey.signAuthorization({ hash: '0x', owner: multisig })
  await Actions.accessKey.signAuthorization(client, {
    accessKey,
    account: multisig,
    // @ts-expect-error Access-key owners are unsupported.
    owner: accessKey,
  })
  // @ts-expect-error Access-key owners are unsupported.
  await client.accessKey.signAuthorization({ hash: '0x', owner: accessKey })
})

test('fundingPolicy accepts a default, ID, or inline policy', async () => {
  for (const fundingPolicy of [
    true as const,
    1n,
    { admins: [owner.address], rules: { maxSlippageBps: 100, sources: {} } },
  ]) {
    const parameters = { account: owner, accessKey, fundingPolicy }
    const authorization = await client.accessKey.signAuthorization(parameters)
    expectTypeOf(authorization).toEqualTypeOf<KeyAuthorization.Signed>()
    expectTypeOf(parameters).toMatchTypeOf<Actions.accessKey.authorize.Args>()
  }
  expectTypeOf(
    await client.accessKey.getFundingPolicyId({
      account: owner,
      accessKey,
    }),
  ).toEqualTypeOf<bigint>()
})

test('prepared funding policy is concrete', async () => {
  const prepared = await client.accessKey.prepareAuthorization({
    account: owner,
    accessKey,
    fundingPolicy: true,
  })
  expectTypeOf(prepared.fundingPolicy).toEqualTypeOf<
    FundingPolicy.Authorization | undefined
  >()
})

test('authorize returns the same shape for local and JSON-RPC accounts', async () => {
  const local = createClient({ chain: tempoLocalnet, account: owner })
  const wallet = createClient({ chain: tempoLocalnet, account: owner.address })
  const options = { expiry: 2_000_000_000, fundingPolicy: true } as const

  expectTypeOf(
    await Actions.accessKey.authorize(local, { accessKey }),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()
  expectTypeOf(
    await local.accessKey.authorize({ accessKey }),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()
  expectTypeOf(
    await Actions.accessKey.authorize(wallet, options),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()
  expectTypeOf(
    await wallet.accessKey.authorize(options),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()
  expectTypeOf(
    await local.accessKey.authorize({ ...options, account: owner.address }),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()
  expectTypeOf(
    await wallet.accessKey.authorize({ account: owner, accessKey }),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()
  expectTypeOf(
    await Actions.accessKey.authorize(client, {
      ...options,
      account: owner.address,
    }),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()
  expectTypeOf(
    await Actions.accessKey.authorize(wallet, { account: owner, accessKey }),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()

  // @ts-expect-error Local authorization needs a supplied key.
  await local.accessKey.authorize(options)
  // @ts-expect-error The wallet RPC requires an expiry.
  await wallet.accessKey.authorize({})
  // @ts-expect-error Wallet authorization does not submit a transaction.
  await wallet.accessKey.authorize({ ...options, gas: 100_000n })
  // @ts-expect-error A client without an account needs an override.
  await client.accessKey.authorize(options)
})

test('authorize returns the same shape for an account union', async () => {
  const account = owner as ViemAccount
  const uncertain = createClient({ chain: tempoLocalnet, account })
  expectTypeOf(
    await uncertain.accessKey.authorize({ accessKey, expiry: 2_000_000_000 }),
  ).toEqualTypeOf<Actions.accessKey.authorize.ReturnValue>()
})

test('authorize result includes all fields', () => {
  expectTypeOf<Actions.accessKey.authorize.ReturnValue>().toEqualTypeOf<{
    rootAddress: `0x${string}`
    keyAuthorization: KeyAuthorization.Signed
    hash: `0x${string}` | undefined
  }>()
})
