import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('get', () => {
  test('default', async () => {
    // An unused nonce key reads as zero.
    const nonce = await Actions.nonce.get(client, {
      account: account.address,
      nonceKey: 1n,
    })

    expect(nonce).toBe(0n)
  })

  test('behavior: defaults to client account', async () => {
    const nonce = await Actions.nonce.get(client, {
      nonceKey: 2n,
    })

    expect(nonce).toBe(0n)
  })

  test('behavior: different nonce keys are independent', async () => {
    expect(
      await Actions.nonce.get(client, {
        account: account.address,
        nonceKey: 10n,
      }),
    ).toBe(0n)
    expect(
      await Actions.nonce.get(client, {
        account: account.address,
        nonceKey: 11n,
      }),
    ).toBe(0n)

    await Actions.token.transferSync(client, {
      amount: 1n,
      nonceKey: 11n,
      to: account2.address,
      token: tempo.pathUsd,
    })

    expect(
      await Actions.nonce.get(client, {
        account: account.address,
        nonceKey: 10n,
      }),
    ).toBe(0n)
    expect(
      await Actions.nonce.get(client, {
        account: account.address,
        nonceKey: 11n,
      }),
    ).toBe(1n)
  })

  test('behavior: different accounts are independent', async () => {
    await Actions.token.transferSync(client, {
      amount: 1n,
      nonceKey: 12n,
      to: account2.address,
      token: tempo.pathUsd,
    })

    expect(
      await Actions.nonce.get(client, {
        account: account.address,
        nonceKey: 12n,
      }),
    ).toBe(1n)
    expect(
      await Actions.nonce.get(client, {
        account: account2.address,
        nonceKey: 12n,
      }),
    ).toBe(0n)
  })
})
