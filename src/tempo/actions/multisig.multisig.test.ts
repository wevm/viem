import { toHex } from 'viem'
import {
  prepareTransactionRequest,
  sendRawTransactionSync,
  signTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { Account } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import * as actions from './index.js'

const client = getClient()
const account = Account.fromMultisig({
  salt: toHex(0x502200, { size: 32 }),
  threshold: 2,
  owners: [accounts[17], accounts[18]],
})
const uninitializedAccount = Account.fromMultisig({
  salt: toHex(0x502201, { size: 32 }),
  threshold: 2,
  owners: [accounts[17], accounts[18]],
})

beforeAll(async () => {
  await actions.token.transferSync(client, {
    account: accounts[0],
    amount: { formatted: '10000' },
    to: account.address,
    token: feeToken,
  })
  const request = await prepareTransactionRequest(client, {
    account,
    calls: [{ to: accounts[0].address, value: 0n }],
    feeToken,
  })
  const transaction = await signTransaction(client, request)
  await sendRawTransactionSync(client, {
    serializedTransaction: transaction,
  })
})

describe('isInitialized', () => {
  test('default', async () => {
    expect(
      await actions.multisig.isInitialized(client, {
        account: account.address,
      }),
    ).toBe(true)
  })

  test('uninitialized', async () => {
    expect(
      await actions.multisig.isInitialized(client, {
        account: uninitializedAccount.address,
      }),
    ).toBe(false)
  })
})

describe('getConfig', () => {
  test('default', async () => {
    expect(
      await actions.multisig.getConfig(client, { account: account.address }),
    ).toEqual({
      owners: account.config.owners,
      threshold: account.config.threshold,
      version: 0n,
    })
  })

  test('behavior: uninitialized account', async () => {
    await expect(
      actions.multisig.getConfig(client, {
        account: uninitializedAccount.address,
      }),
    ).rejects.toThrow('NotMultisigAccount')
  })
})

describe('updateConfig', () => {
  test('default', async () => {
    const current = await actions.multisig.getConfig(client, {
      account: account.address,
    })
    const hash = await actions.multisig.updateConfig(client, {
      account,
      owners: account.config.owners,
      threshold: account.config.threshold,
    })
    const receipt = await waitForTransactionReceipt(client, { hash })

    expect(receipt.status).toBe('success')
    await expect(
      actions.multisig.getConfig(client, { account: account.address }),
    ).resolves.toMatchObject({ version: current.version + 1n })
  })
})

describe('updateConfigSync', () => {
  test('default', async () => {
    const current = await actions.multisig.getConfig(client, {
      account: account.address,
    })
    const result = await actions.multisig.updateConfigSync(client, {
      account,
      owners: account.config.owners,
      threshold: account.config.threshold,
    })

    expect(result).toMatchObject({
      account: account.address,
      owners: account.config.owners,
      threshold: account.config.threshold,
    })
    expect(result.receipt.status).toBe('success')
    await expect(
      actions.multisig.getConfig(client, { account: account.address }),
    ).resolves.toMatchObject({ version: current.version + 1n })
  })
})
