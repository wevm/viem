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
  expect(call.args[6]).toBe('0x')
  expect(call.args[7]).toBe('0x')
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
})

test.todo(
  'behavior: requests withdrawal from zone to parent chain (blocked: dev node lacks live zone infra; v2 skipped)',
)
