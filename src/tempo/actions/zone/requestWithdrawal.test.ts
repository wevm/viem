import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

import { requestWithdrawal } from './requestWithdrawal.js'
import { requestWithdrawalSync } from './requestWithdrawalSync.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const recipient = Account.fromSecp256k1(tempo.accounts[1]!.privateKey).address
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

test('behavior: encodes the 8-argument outbox requestWithdrawal call', () => {
  const [, call] = requestWithdrawal.calls({
    amount: 1n,
    to: account.address,
    token: '0x20c0000000000000000000000000000000000001',
  })

  expect(call.functionName).toBe('requestWithdrawal')
  expect(call.args).toHaveLength(8)
  expect(call.args[4]).toBe(0n)
  expect(call.args[6]).toBe('0x')
  expect(call.args[7]).toBe('0x')
})

test('behavior: keeps callback gas separate from transaction gas', () => {
  const [, call] = requestWithdrawal.calls({
    amount: 1n,
    callbackGas: 10_000_000n,
    data: '0x1234',
    fallbackRecipient: recipient,
    memo: `0x${'01'.repeat(32)}`,
    to: account.address,
    token: '0x20c0000000000000000000000000000000000001',
  })

  expect(call.args[4]).toBe(10_000_000n)
  expect(call.args.slice(3)).toMatchInlineSnapshot(`
    [
      "0x0101010101010101010101010101010101010101010101010101010101010101",
      10000000n,
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x1234",
      "0x",
    ]
  `)
})

test('behavior: prepares a withdrawal', async () => {
  const prepared = await requestWithdrawal.prepare(client, {
    amount: 1n,
    callbackGas: 100_000n,
    data: '0x1234',
    fallbackRecipient: recipient,
    gas: 1_000_000n,
    maxFeePerGas: 1_000_000_001n,
    maxPriorityFeePerGas: 1_000_000_001n,
    memo: `0x${'01'.repeat(32)}`,
    nonce: 0,
    to: recipient,
    token: tempo.pathUsd,
  })
  const { request, ...withdrawal } = prepared

  expect(withdrawal).toMatchInlineSnapshot(`
    {
      "amount": 1n,
      "callbackGas": 100000n,
      "data": "0x1234",
      "fallbackRecipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "maxFee": 1001n,
      "memo": "0x0101010101010101010101010101010101010101010101010101010101010101",
      "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "token": "0x20c0000000000000000000000000000000000000",
    }
  `)
  expect(request).toMatchObject({
    account,
    calls: requestWithdrawal.calls({
      amount: 1n,
      callbackGas: 100_000n,
      data: '0x1234',
      fallbackRecipient: recipient,
      memo: `0x${'01'.repeat(32)}`,
      to: recipient,
      token: tempo.pathUsd,
    }),
    chainId: tempoLocalnet.id,
    from: account.address,
    gas: 1_000_000n,
    maxFeePerGas: 1_000_000_001n,
    maxPriorityFeePerGas: 1_000_000_001n,
    nonce: 0,
  })
})

test('error: prepared fee parameters unavailable', async () => {
  const prepare: typeof tempoLocalnet.transaction.prepare = [
    (request) => ({
      ...request,
      gas: undefined,
      gasPrice: undefined,
      maxFeePerGas: undefined,
    }),
    { runAt: ['afterFillParameters'] },
  ]
  const chain = {
    ...tempoLocalnet,
    transaction: {
      ...tempoLocalnet.transaction,
      prepare,
    },
  }
  const client = Client.create({
    account,
    chain,
    feeToken: tempo.pathUsd,
    transport: http(tempo.rpcUrl),
  })

  await expect(
    requestWithdrawal.prepare(client, {
      amount: 1n,
      chain,
      gas: 1_000_000n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
      nonce: 0,
      token: tempo.pathUsd,
    }),
  ).rejects.toThrow('Prepared transaction fee parameters are unavailable.')
})

test('behavior: sends withdrawals', async () => {
  await expect(
    requestWithdrawal(client, {
      amount: 0n,
      gas: 1_000_000n,
      to: recipient,
      token: tempo.pathUsd,
    }),
  ).resolves.toMatch(/^0x[\da-f]{64}$/)

  const { receipt } = await requestWithdrawalSync(client, {
    amount: 0n,
    gas: 1_000_000n,
    token: tempo.pathUsd,
  })
  expect(receipt.status).toMatchInlineSnapshot('"success"')
})

test('error: no account', async () => {
  const client = Client.create({
    chain: tempoLocalnet,
    transport: http(tempo.rpcUrl),
  })

  await expect(
    requestWithdrawal(client, {
      amount: 1n,
      token: '0x20c0000000000000000000000000000000000000',
    }),
  ).rejects.toThrow('`account` is required.')

  await expect(
    requestWithdrawal.prepare(client, {
      amount: 1n,
      token: '0x20c0000000000000000000000000000000000000',
    }),
  ).rejects.toThrow('`to` is required.')

  await expect(
    requestWithdrawalSync(client, {
      amount: 1n,
      token: '0x20c0000000000000000000000000000000000000',
    }),
  ).rejects.toThrow('`account` is required.')
})
