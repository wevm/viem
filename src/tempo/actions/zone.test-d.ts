import type { Address } from 'abitype'
import type * as Hex from 'ox/Hex'
import { expectTypeOf, test } from 'vitest'
import { sendTransaction } from '../../actions/wallet/sendTransaction.js'
import { tempoModerato } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import type { Hash } from '../../types/misc.js'
import { decorator } from '../Decorator.js'
import type { TransactionReceipt } from '../Transaction.js'
import { zoneModerato } from '../zones/index.js'
import * as zoneActions from './zone.js'

const transport = custom({
  async request() {
    return null
  },
})
const client = createClient({
  account: '0x0000000000000000000000000000000000000001',
  chain: tempoModerato,
  transport,
})
const zoneClient = createClient({
  account: '0x0000000000000000000000000000000000000001',
  chain: zoneModerato(7),
  transport,
})
const decoratedZoneClient = zoneClient.extend(decorator())

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

test('requestWithdrawal.prepare returns a request, maximum fee, and details', async () => {
  const prepared = await zoneActions.requestWithdrawal.prepare(zoneClient, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    callbackGas: 10_000_000n,
    to: '0x0000000000000000000000000000000000000001',
  })

  expectTypeOf(prepared).toEqualTypeOf<
    zoneActions.requestWithdrawal.prepare.ReturnType<
      (typeof zoneClient)['chain'],
      (typeof zoneClient)['account'],
      undefined,
      undefined
    >
  >()
  expectTypeOf(prepared.request.type).toEqualTypeOf<'tempo'>()
  expectTypeOf(prepared.request.gas).toEqualTypeOf<bigint>()
  expectTypeOf(prepared.request.nonce).toEqualTypeOf<number>()
  expectTypeOf(prepared.request.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(prepared.request.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(prepared.maxFee).toEqualTypeOf<bigint>()
  expectTypeOf(prepared.amount).toEqualTypeOf<bigint>()
  expectTypeOf(prepared.callbackGas).toEqualTypeOf<bigint>()
  expectTypeOf(prepared).not.toHaveProperty('totalFee')
  expectTypeOf(prepared).not.toHaveProperty('transactionFee')
  expectTypeOf(prepared).not.toHaveProperty('withdrawalFee')
  expectTypeOf(prepared).not.toHaveProperty('estimatedGas')

  await sendTransaction(zoneClient, prepared.request)
})

test('requestWithdrawal accepts a prepared gateway callback shape', async () => {
  // Canary for the earn deposit-zone flow: a fully populated gateway
  // withdrawal (token, recipient, callback data) must stay assignable.
  const args = {} as {
    amount: bigint
    callbackGas: bigint
    data: Hex.Hex
    fallbackRecipient: Address
    to: Address
    token: Address
  }
  expectTypeOf(args).toExtend<
    zoneActions.requestWithdrawal.Parameters<
      (typeof zoneClient)['chain'],
      (typeof zoneClient)['account']
    >
  >()
  await zoneActions.requestWithdrawal(zoneClient, args)
  zoneActions.requestWithdrawal.calls(args)
})

test('withdrawal callback gas is distinct from transaction gas', async () => {
  await zoneActions.requestWithdrawal(zoneClient, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    callbackGas: 10_000_000n,
    gas: 1_000_000n,
  })
})

test('requestWithdrawalSync returns a receipt and sender tag', async () => {
  const result = await zoneActions.requestWithdrawalSync(zoneClient, {
    amount: 1n,
    token: '0x20c0000000000000000000000000000000000000',
  })

  expectTypeOf(
    result,
  ).toEqualTypeOf<zoneActions.requestWithdrawalSync.ReturnValue>()
  expectTypeOf(result.receipt).toEqualTypeOf<TransactionReceipt>()
  expectTypeOf(result.senderTag).toEqualTypeOf<Hash>()

  const explicitAccountClient = createClient({
    chain: zoneModerato(7),
    transport,
  })
  const explicitResult = await zoneActions.requestWithdrawalSync(
    explicitAccountClient,
    {
      account: '0x0000000000000000000000000000000000000001',
      amount: 1n,
      token: '0x20c0000000000000000000000000000000000000',
    },
  )

  expectTypeOf(explicitResult.senderTag).toEqualTypeOf<Hash>()
})

test('decorated requestWithdrawal.prepare preserves client types', async () => {
  const prepared = await decoratedZoneClient.zone.requestWithdrawal.prepare({
    amount: 1n,
    token: '0x20c0000000000000000000000000000000000000',
  })

  expectTypeOf(prepared.maxFee).toEqualTypeOf<bigint>()
  expectTypeOf(prepared.request.type).toEqualTypeOf<'tempo'>()
  await sendTransaction(zoneClient, prepared.request)
})

test('decorated requestWithdrawalSync returns a receipt and sender tag', async () => {
  const result = await decoratedZoneClient.zone.requestWithdrawalSync({
    amount: 1n,
    token: '0x20c0000000000000000000000000000000000000',
  })

  expectTypeOf(result.receipt).toEqualTypeOf<TransactionReceipt>()
  expectTypeOf(result.senderTag).toEqualTypeOf<Hash>()
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

test('getZoneInfo returns the imported Tempo block number', async () => {
  const info = await zoneActions.getZoneInfo(zoneClient)

  expectTypeOf(info.tempoBlockNumber).toEqualTypeOf<bigint>()
})

test('waitForTempoBlock returns zone info', async () => {
  const info = await zoneActions.waitForTempoBlock(zoneClient, {
    tempoBlockNumber: 1n,
  })

  expectTypeOf(info).toEqualTypeOf<zoneActions.getZoneInfo.ReturnType>()
})
