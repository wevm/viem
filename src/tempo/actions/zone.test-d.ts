import { expectTypeOf, test } from 'vitest'
import { tempoModerato } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import * as zoneActions from './zone.js'

const client = createClient({
  account: '0x0000000000000000000000000000000000000001',
  chain: tempoModerato,
  transport: custom({
    async request() {
      return null
    },
  }),
})

test('encryptedDeposit.prepare returns a reusable encrypted deposit payload', async () => {
  const prepared = await zoneActions.encryptedDeposit.prepare(client, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    bouncebackRecipient: '0x0000000000000000000000000000000000000001',
    recipient: '0x0000000000000000000000000000000000000001',
    zoneId: 7,
  })

  expectTypeOf(prepared).toEqualTypeOf<zoneActions.PreparedEncryptedDeposit>()

  zoneActions.encryptedDeposit.calls(prepared)
  await zoneActions.encryptedDeposit(client, prepared)
  await zoneActions.encryptedDepositSync(client, prepared)
  await zoneActions.encryptedDepositSync(client, {
    ...prepared,
    pollingInterval: 100,
    timeout: 1_000,
  })
})

test('encryptedDeposit.prepareRecipient returns reusable encrypted recipient data', async () => {
  const prepared = await zoneActions.encryptedDeposit.prepareRecipient(client, {
    portalAddress: '0x0000000000000000000000000000000000000002',
    recipient: '0x0000000000000000000000000000000000000001',
    zoneId: 7,
  })

  expectTypeOf(
    prepared,
  ).toEqualTypeOf<zoneActions.PreparedEncryptedDepositRecipient>()
})

test('requestWithdrawal.prepare returns calls and fee details', async () => {
  const prepared = await zoneActions.requestWithdrawal.prepare(client, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    callbackGas: 10_000_000n,
    to: '0x0000000000000000000000000000000000000001',
    estimateTransactionFee: true,
    transactionFeeScale: 1_000_000_000_000n,
  })

  expectTypeOf(
    prepared,
  ).toEqualTypeOf<zoneActions.requestWithdrawal.prepare.ReturnType>()

  // @ts-expect-error transactionFeeScale is required when estimating.
  await zoneActions.requestWithdrawal.prepare(client, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    to: '0x0000000000000000000000000000000000000001',
    estimateTransactionFee: true,
  })
})

test('withdrawal callback gas is distinct from transaction gas', async () => {
  await zoneActions.requestWithdrawal(client, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    callbackGas: 10_000_000n,
    gas: 1_000_000n,
  })
})

test('encryptedDeposit still accepts plaintext parameters', async () => {
  await zoneActions.encryptedDeposit(client, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    zoneId: 7,
  })
})

test('getEncryptionKey returns the active key and index', async () => {
  const result = await zoneActions.getEncryptionKey(client, { zoneId: 7 })

  expectTypeOf(result).toEqualTypeOf<zoneActions.getEncryptionKey.ReturnValue>()
  expectTypeOf(result.publicKey.prefix).toEqualTypeOf<2 | 3>()
  zoneActions.getEncryptionKey.calls({
    portalAddress: '0x0000000000000000000000000000000000000001',
  })
})

test('waitForDepositStatus returns a deposit status', async () => {
  const result = await zoneActions.waitForDepositStatus(client, {
    tempoBlockNumber: 1n,
  })

  expectTypeOf(result).toEqualTypeOf<zoneActions.getDepositStatus.ReturnType>()
})
