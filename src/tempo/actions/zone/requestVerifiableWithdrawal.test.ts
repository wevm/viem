import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

import { requestVerifiableWithdrawal } from './requestVerifiableWithdrawal.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)

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
})
