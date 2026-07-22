import type { Address, Hex } from 'ox'
import { describe, expectTypeOf, test } from 'vitest'

import { Actions as CoreActions } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'
import { zoneModerato } from 'viem/tempo/zones'

import { deposit } from './deposit.js'
import { depositSync } from './depositSync.js'
import { encryptedDeposit } from './encryptedDeposit.js'
import { encryptedDepositSync } from './encryptedDepositSync.js'
import { getAuthorizationTokenInfo } from './getAuthorizationTokenInfo.js'
import { getWithdrawalFee } from './getWithdrawalFee.js'
import { getZoneInfo } from './getZoneInfo.js'
import { requestVerifiableWithdrawal } from './requestVerifiableWithdrawal.js'
import { requestVerifiableWithdrawalSync } from './requestVerifiableWithdrawalSync.js'
import { requestWithdrawal } from './requestWithdrawal.js'
import { requestWithdrawalSync } from './requestWithdrawalSync.js'
import { signAuthorizationToken } from './signAuthorizationToken.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})
const zoneClient = Client.create({
  account,
  chain: zoneModerato(7),
  transport: http(),
})
const publicZoneClient = Client.create({
  chain: zoneModerato(7),
  transport: http(),
})

describe('zone action types', () => {
  test('write action return types', async () => {
    expectTypeOf(
      deposit(client, {
        amount: 1n,
        token: '0x20C0000000000000000000000000000000000001',
        zoneId: 7,
      }),
    ).resolves.toEqualTypeOf<Hex.Hex>()
    expectTypeOf(
      encryptedDeposit(client, {
        amount: 1n,
        token: '0x20C0000000000000000000000000000000000001',
        zoneId: 7,
      }),
    ).resolves.toEqualTypeOf<Hex.Hex>()
    expectTypeOf(
      requestWithdrawal(client, {
        amount: 1n,
        callbackGas: 10_000_000n,
        gas: 1_000_000n,
        token: '0x20C0000000000000000000000000000000000001',
      }),
    ).resolves.toEqualTypeOf<Hex.Hex>()
    expectTypeOf(
      requestVerifiableWithdrawal(client, {
        amount: 1n,
        callbackGas: 10_000_000n,
        gas: 1_000_000n,
        revealTo: '0x02',
        token: '0x20C0000000000000000000000000000000000001',
      }),
    ).resolves.toEqualTypeOf<Hex.Hex>()

    expectTypeOf(
      (
        await depositSync(client, {
          amount: 1n,
          token: '0x20C0000000000000000000000000000000000001',
          zoneId: 7,
        })
      ).receipt,
    ).not.toBeAny()
    expectTypeOf(
      (
        await encryptedDepositSync(client, {
          amount: 1n,
          pollingInterval: 100,
          timeout: 1_000,
          token: '0x20C0000000000000000000000000000000000001',
          zoneId: 7,
        })
      ).receipt,
    ).not.toBeAny()
    const withdrawal = await requestWithdrawalSync(client, {
      amount: 1n,
      pollingInterval: 100,
      timeout: 1_000,
      token: '0x20C0000000000000000000000000000000000001',
    })
    expectTypeOf(withdrawal.receipt).not.toBeAny()
    expectTypeOf(withdrawal.senderTag).toEqualTypeOf<Hex.Hex>()
    expectTypeOf(
      (
        await requestVerifiableWithdrawalSync(client, {
          amount: 1n,
          pollingInterval: 100,
          revealTo: '0x02',
          timeout: 1_000,
          token: '0x20C0000000000000000000000000000000000001',
        })
      ).receipt,
    ).not.toBeAny()
  })

  test('preparation helper types', async () => {
    const recipient = await Actions.zone.encryptedDeposit.prepareRecipient(
      client,
      {
        portalAddress: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
        recipient: account.address,
        zoneId: 7,
      },
    )
    expectTypeOf(
      recipient,
    ).toEqualTypeOf<Actions.zone.PreparedEncryptedDepositRecipient>()

    const prepared = await Actions.zone.requestWithdrawal.prepare(zoneClient, {
      amount: 1n,
      callbackGas: 10_000_000n,
      gas: 1_000_000n,
      nonce: 7,
      token: '0x20C0000000000000000000000000000000000001',
    })
    expectTypeOf(prepared.request.account).toEqualTypeOf<typeof account>()
    expectTypeOf(prepared.request.gas).toEqualTypeOf<1_000_000n>()
    expectTypeOf(prepared.request.nonce).toEqualTypeOf<7>()
    expectTypeOf(prepared.request.maxFeePerGas).toEqualTypeOf<bigint>()
    expectTypeOf(prepared.request.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
    expectTypeOf(prepared.maxFee).toEqualTypeOf<bigint>()
    expectTypeOf(prepared.callbackGas).toEqualTypeOf<bigint>()
    expectTypeOf(prepared).not.toHaveProperty('totalFee')
    expectTypeOf(prepared).not.toHaveProperty('transactionFee')
    expectTypeOf(prepared).not.toHaveProperty('withdrawalFee')
    expectTypeOf(prepared).not.toHaveProperty('estimatedGas')

    await CoreActions.transaction.send(zoneClient, prepared.request)

    const feeToken = '0x20C0000000000000000000000000000000000002'
    const overridden = await Actions.zone.requestWithdrawal.prepare(
      publicZoneClient,
      {
        account,
        amount: 1n,
        feeToken,
        token: '0x20C0000000000000000000000000000000000001',
      },
    )
    expectTypeOf(overridden.request.account).toEqualTypeOf<typeof account>()
    expectTypeOf(overridden.request.feeToken).toEqualTypeOf<typeof feeToken>()
  })

  test('read action return types', async () => {
    expectTypeOf(
      await getAuthorizationTokenInfo(client),
    ).toEqualTypeOf<getAuthorizationTokenInfo.ReturnType>()
    const encryptionKey = await Actions.zone.getEncryptionKey(client, {
      zoneId: 7,
    })
    expectTypeOf(encryptionKey.publicKey.prefix).toEqualTypeOf<2 | 3>()
    expectTypeOf(
      await Actions.zone.waitForTempoBlock(client, {
        tempoBlockNumber: 1n,
      }),
    ).toEqualTypeOf<getZoneInfo.ReturnType>()
    expectTypeOf(
      await getWithdrawalFee(client, { callbackGas: 100_000n }),
    ).toEqualTypeOf<bigint>()
    const info = await getZoneInfo(client)
    expectTypeOf(info.sequencers).toEqualTypeOf<readonly Address.Address[]>()
    expectTypeOf(info.tempoBlockNumber).toEqualTypeOf<bigint>()
    expectTypeOf(
      await signAuthorizationToken(client),
    ).toEqualTypeOf<signAuthorizationToken.ReturnType>()
  })

  test('public payload types', () => {
    expectTypeOf<Actions.zone.EncryptedPayload>().not.toBeAny()
    expectTypeOf<Actions.zone.PreparedEncryptedDeposit>().not.toBeAny()
    expectTypeOf<Actions.zone.PreparedEncryptedDepositRecipient>().not.toBeAny()
  })

  test('error exports', () => {
    expectTypeOf(
      new Actions.zone.Errors.WaitForTempoBlockTimeoutError({
        tempoBlockNumber: 1n,
      }),
    ).toEqualTypeOf<Actions.zone.Errors.WaitForTempoBlockTimeoutError>()

    type FlatErrorKey = Extract<keyof typeof Actions.zone, `${string}Error`>

    expectTypeOf<FlatErrorKey>().toEqualTypeOf<never>()
  })
})
