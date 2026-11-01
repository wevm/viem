import type { Address, Hex } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, createClient, http, tempoActions } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const account = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const client = createClient({
  account,
  chain: tempoLocalnet,
  transport: http(),
}).extend(tempoActions())

test('createPolicySync: returns the PolicyCreated event', async () => {
  const result = await Actions.attested.createPolicySync(client, {
    delay: 0,
    maxKeyLifetime: 3_600,
    measurements: ['0x'],
    salt: '0x',
    scheme: 1,
  })

  expectTypeOf(result.policyId).toEqualTypeOf<Hex>()
  expectTypeOf(result.creator).toEqualTypeOf<Address>()
  expectTypeOf(result.maxKeyLifetime).toEqualTypeOf<bigint>()
})

test('registerKeySync: returns the KeyRegistered event', async () => {
  const result = await client.attested.registerKeySync({
    document: '0x',
    policyId: '0x',
    programKey: '0x',
    slot: 0,
  })

  expectTypeOf(result.slot).toEqualTypeOf<number>()
  expectTypeOf(result.validUntil).toEqualTypeOf<bigint>()
})

test('getPolicy', async () => {
  const policy = await client.attested.getPolicy({ policyId: '0x' })

  expectTypeOf(policy.owner).toEqualTypeOf<Address>()
  expectTypeOf(policy.paused).toEqualTypeOf<boolean>()
  expectTypeOf(policy.maxKeyLifetime).toEqualTypeOf<number>()
})

test('attested account sends transactions', async () => {
  const attested = Account.fromAttested({
    policyId: '0x',
    sign: async () => '0x',
    userTag: '0x',
  })

  const receipt = await client.sendTransactionSync({
    account: attested,
    to: '0x0000000000000000000000000000000000000001',
  })

  expectTypeOf(receipt.transactionHash).toEqualTypeOf<Hex>()
})
