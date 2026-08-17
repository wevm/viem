import { Account } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import * as actions from './index.js'

const client = getClient()
const account = Account.fromMultisig({
  threshold: 2,
  owners: [
    { owner: accounts[17].address, weight: 1 },
    { owner: accounts[18].address, weight: 1 },
  ],
})

describe('isInitialized', () => {
  test('uninitialized', async () => {
    expect(
      await actions.multisig.isInitialized(client, {
        account: account.address,
      }),
    ).toBe(false)
  })
})

describe('getConfig', () => {
  test('behavior: uninitialized account', async () => {
    await expect(
      actions.multisig.getConfig(client, { account: account.address }),
    ).rejects.toThrow('NotMultisigAccount')
  })
})
