import { KeyAuthorization } from 'ox/tempo'
import { toHex } from 'viem'
import {
  getTransactionReceipt,
  prepareTransactionRequest,
  sendRawTransactionSync,
  signTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { tempoLocalnet } from 'viem/chains'
import { Account, createClient, Multisig } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  feeToken,
  getClient,
  http,
  tokens,
} from '~test/tempo/config.js'
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

function getStoreClient() {
  const store = Multisig.Store.memory()
  return {
    client: createClient({
      chain: tempoLocalnet,
      multisig: { store },
      tokens,
      transport: http(),
    }),
    store,
  }
}

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

describe('approveTransaction', () => {
  test('collects approvals and submits asynchronously', async () => {
    const owner_1 = accounts[1]
    const owner_2 = accounts[2]
    const account = Account.fromMultisig({
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x502220, { size: 32 }),
      threshold: 2,
    })
    const { client, store } = getStoreClient()

    await actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })
    const pending = await actions.multisig.approveTransaction(client, {
      account: owner_1,
      calls: [{ to: accounts[20].address, value: 0n }],
      feeToken,
      multisig: account,
    })

    expect(pending.status).toBe('pending')
    expect(pending.signatures).toBe(1)
    expect(pending.request.account).toBeUndefined()
    expect(pending.request.from).toBe(account.address.toLowerCase())
    const { request: _, ...pendingOperation } = pending
    expect(
      await actions.multisig.getOperation(client, { id: pending.id, store }),
    ).toStrictEqual(pendingOperation)
    expect(
      await actions.multisig.getOperation(client, { id: pending.id }),
    ).toStrictEqual(pendingOperation)

    const success = await actions.multisig.approveTransaction(client, {
      ...pending.request,
      account: owner_2,
    })
    if (success.status !== 'success' || !success.transactionHash)
      throw new Error('Expected success.')
    await expect(
      waitForTransactionReceipt(client, { hash: success.transactionHash }),
    ).resolves.toMatchObject({ status: 'success' })
    await expect(
      actions.multisig.getOperation(client, {
        id: `0x${'ff'.repeat(32)}`,
        store,
      }),
    ).resolves.toBeNull()
    await expect(
      actions.multisig.getOperation(client, {
        id: `0x${'ff'.repeat(32)}`,
      }),
    ).resolves.toBeNull()
  })
})

describe('approveTransactionSync', () => {
  test('collects approvals and submits synchronously', async () => {
    const owner_1 = accounts[3]
    const owner_2 = accounts[4]
    const account = Account.fromMultisig({
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x502221, { size: 32 }),
      threshold: 2,
    })
    const { client } = getStoreClient()

    await actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })
    const pending = await actions.multisig.approveTransactionSync(client, {
      account: owner_1,
      calls: [{ to: accounts[20].address, value: 0n }],
      feeToken,
      multisig: account.config,
    })
    expect(pending.status).toBe('pending')
    expect(pending.request.from).toBe(account.address.toLowerCase())

    const success = await actions.multisig.approveTransactionSync(client, {
      ...pending.request,
      account: owner_2,
      timeout: 30_000,
    })
    if (success.status !== 'success' || !success.transactionHash)
      throw new Error('Expected success.')
    await expect(
      getTransactionReceipt(client, { hash: success.transactionHash }),
    ).resolves.toMatchObject({ status: 'success' })
  })

  test('submits a complete local multisig envelope', async () => {
    const owner = accounts[5]
    const account = Account.fromMultisig({
      owners: [owner],
      salt: toHex(0x502222, { size: 32 }),
    })
    const { client } = getStoreClient()

    await actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })
    const success = await actions.multisig.approveTransactionSync(client, {
      account,
      calls: [{ to: accounts[20].address, value: 0n }],
      feeToken,
    })

    if (success.status !== 'success' || !success.transactionHash)
      throw new Error('Expected success.')
    await expect(
      getTransactionReceipt(client, { hash: success.transactionHash }),
    ).resolves.toMatchObject({ status: 'success' })
  })
})

describe('getOperation', () => {
  test('returns a key authorization operation', async () => {
    const { client, store } = getStoreClient()
    const id = `0x${'aa'.repeat(32)}` as const
    const now = Date.now()
    const operation = Multisig.Operation.from({
      account: account.address,
      approvals: [],
      config: account.config,
      createdAt: now,
      id,
      keyAuthorization: KeyAuthorization.from({
        address: accounts[6].address,
        chainId: 1337n,
        expiry: 1_800_000_000,
        type: 'secp256k1',
      }),
      signatures: 0,
      status: 'pending',
      threshold: 2,
      updatedAt: now,
      version: 0n,
      weight: 0,
    })
    await store.compareAndSet(`multisig:operation:${id}`, null, operation)

    await expect(
      actions.multisig.getOperation(client, { id }),
    ).resolves.toEqual(operation)
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
