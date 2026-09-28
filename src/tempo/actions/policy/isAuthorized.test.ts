import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('isAuthorized', () => {
  test('special policy: always-reject (policyId 0)', async () => {
    expect(
      await Actions.policy.isAuthorized(client, {
        policyId: 0n,
        user: account.address,
      }),
    ).toBe(false)
  })

  test('special policy: always-allow (policyId 1)', async () => {
    expect(
      await Actions.policy.isAuthorized(client, {
        policyId: 1n,
        user: account.address,
      }),
    ).toBe(true)
  })

  test('whitelist policy', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      addresses: [account2.address],
      type: 'whitelist',
    })

    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      }),
    ).toBe(true)
    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account.address,
      }),
    ).toBe(false)
  })

  test('blacklist policy', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      addresses: [account2.address],
      type: 'blacklist',
    })

    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      }),
    ).toBe(false)
    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account.address,
      }),
    ).toBe(true)
  })
})
