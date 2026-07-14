import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

import { requestWithdrawal } from './requestWithdrawal.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)

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
    to: account.address,
    token: '0x20c0000000000000000000000000000000000001',
  })

  expect(call.args[4]).toBe(10_000_000n)
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
})
