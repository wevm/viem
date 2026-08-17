import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

import { requestVerifiableWithdrawal } from './requestVerifiableWithdrawal.js'
import { requestVerifiableWithdrawalSync } from './requestVerifiableWithdrawalSync.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const recipient = Account.fromSecp256k1(tempo.accounts[1]!.privateKey).address
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const revealTo =
  '0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'

test('behavior: encodes the outbox requestWithdrawal call with revealTo', () => {
  const revealTo = '0x02abc'
  const [, call] = requestVerifiableWithdrawal.calls({
    amount: 1n,
    revealTo,
    to: account.address,
    token: '0x20c0000000000000000000000000000000000001',
  })

  expect(call.functionName).toBe('requestWithdrawal')
  expect(call.args).toHaveLength(8)
  expect(call.args[7]).toBe(revealTo)
})

test('behavior: encodes callback gas', () => {
  const [, call] = requestVerifiableWithdrawal.calls({
    amount: 1n,
    callbackGas: 10_000_000n,
    data: '0x1234',
    fallbackRecipient: recipient,
    memo: `0x${'01'.repeat(32)}`,
    revealTo: '0x02abc',
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
      "0x02abc",
    ]
  `)
})

test('behavior: sends verifiable withdrawals', async () => {
  await expect(
    requestVerifiableWithdrawal(client, {
      amount: 0n,
      revealTo,
      to: recipient,
      token: tempo.pathUsd,
    }),
  ).resolves.toMatch(/^0x[\da-f]{64}$/)

  const { receipt } = await requestVerifiableWithdrawalSync(client, {
    amount: 0n,
    gas: 1_000_000n,
    revealTo,
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
    requestVerifiableWithdrawal(client, {
      amount: 1n,
      revealTo: '0x02abc',
      token: '0x20c0000000000000000000000000000000000000',
    }),
  ).rejects.toThrow('`account` is required.')

  await expect(
    requestVerifiableWithdrawalSync(client, {
      amount: 1n,
      revealTo: '0x02abc',
      token: '0x20c0000000000000000000000000000000000000',
    }),
  ).rejects.toThrow('`account` is required.')
})
