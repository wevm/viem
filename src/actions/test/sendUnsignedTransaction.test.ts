import { expect, test } from 'vitest'

import { accounts, address } from '../../_test/constants.js'
import { publicClient, testClient } from '../../_test/utils.js'
import { celo } from '../../chains.js'
import { createTestClient } from '../../clients/createTestClient.js'
import { defineChain } from '../../utils/chain.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'

import { http } from '../../index.js'
import { mine } from './mine.js'
import { sendUnsignedTransaction } from './sendUnsignedTransaction.js'
import { setBalance } from './setBalance.js'

const sourceAccount = {
  address: address.vitalik,
} as const
const targetAccount = accounts[0]

test('sends unsigned transaction', async () => {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await setBalance(testClient, {
    address: sourceAccount.address,
    value: parseEther('10000'),
  })

  const balance = await getBalance(publicClient, {
    address: sourceAccount.address,
  })

  expect(
    await sendUnsignedTransaction(testClient, {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testClient, { blocks: 1 })

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toBeLessThan(balance)
})

test('sends unsigned transaction (w/ formatter)', async () => {
  const chain = defineChain(testClient.chain, {
    formatters: {
      transactionRequest: celo.formatters!.transactionRequest,
    },
  })
  const testClient2 = createTestClient({
    chain,
    mode: 'anvil',
    transport: http(),
  })

  await setBalance(testClient2, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await setBalance(testClient2, {
    address: sourceAccount.address,
    value: parseEther('10000'),
  })

  const balance = await getBalance(publicClient, {
    address: sourceAccount.address,
  })

  expect(
    await sendUnsignedTransaction(testClient2, {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testClient2, { blocks: 1 })

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toBeLessThan(balance)
})
