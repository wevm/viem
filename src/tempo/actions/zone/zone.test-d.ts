import type { Hex } from 'ox'
import { describe, expectTypeOf, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { deposit } from './deposit.js'
import { depositSync } from './depositSync.js'
import { encryptedDeposit } from './encryptedDeposit.js'
import { encryptedDepositSync } from './encryptedDepositSync.js'
import { getAuthorizationTokenInfo } from './getAuthorizationTokenInfo.js'
import { getDepositStatus } from './getDepositStatus.js'
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
const client = Client.create({ account, chain: tempoLocalnet, transport: http() })

describe('zone action types', () => {
  test('write action return types', async () => {
    expectTypeOf(deposit(client, { amount: 1n, token: '0x20C0000000000000000000000000000000000001', zoneId: 7 })).resolves.toEqualTypeOf<Hex.Hex>()
    expectTypeOf(encryptedDeposit(client, { amount: 1n, token: '0x20C0000000000000000000000000000000000001', zoneId: 7 })).resolves.toEqualTypeOf<Hex.Hex>()
    expectTypeOf(requestWithdrawal(client, { amount: 1n, token: '0x20C0000000000000000000000000000000000001' })).resolves.toEqualTypeOf<Hex.Hex>()
    expectTypeOf(requestVerifiableWithdrawal(client, { amount: 1n, revealTo: '0x02', token: '0x20C0000000000000000000000000000000000001' })).resolves.toEqualTypeOf<Hex.Hex>()

    expectTypeOf((await depositSync(client, { amount: 1n, token: '0x20C0000000000000000000000000000000000001', zoneId: 7 })).receipt).not.toBeAny()
    expectTypeOf((await encryptedDepositSync(client, { amount: 1n, token: '0x20C0000000000000000000000000000000000001', zoneId: 7 })).receipt).not.toBeAny()
    expectTypeOf((await requestWithdrawalSync(client, { amount: 1n, token: '0x20C0000000000000000000000000000000000001' })).receipt).not.toBeAny()
    expectTypeOf((await requestVerifiableWithdrawalSync(client, { amount: 1n, revealTo: '0x02', token: '0x20C0000000000000000000000000000000000001' })).receipt).not.toBeAny()
  })

  test('read action return types', async () => {
    expectTypeOf(await getAuthorizationTokenInfo(client)).toEqualTypeOf<getAuthorizationTokenInfo.ReturnType>()
    expectTypeOf(await getDepositStatus(client, { tempoBlockNumber: 1n })).toEqualTypeOf<getDepositStatus.ReturnType>()
    expectTypeOf(await getWithdrawalFee(client)).toEqualTypeOf<bigint>()
    expectTypeOf(await getZoneInfo(client)).toEqualTypeOf<getZoneInfo.ReturnType>()
    expectTypeOf(await signAuthorizationToken(client)).toEqualTypeOf<signAuthorizationToken.ReturnType>()
  })
})
