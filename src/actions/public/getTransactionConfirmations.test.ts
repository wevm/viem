import { expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { getBlockNumber } from './getBlockNumber.js'
import { getTransactionConfirmations } from './getTransactionConfirmations.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const hash = await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 1 })
  const transactionReceipt = await getTransactionReceipt(client, {
    hash,
  })
  expect(
    await getTransactionConfirmations(client, {
      transactionReceipt,
    }),
  ).toBe(1n)
})

test('multiple confirmations', async () => {
  const hash = await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 10 })
  const transactionReceipt = await getTransactionReceipt(client, {
    hash,
  })
  expect(
    await getTransactionConfirmations(client, {
      transactionReceipt,
    }),
  ).toBe(10n)
})

test('args: hash', async () => {
  const hash = await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 10 })
  expect(
    await getTransactionConfirmations(client, {
      hash,
    }),
  ).toBe(10n)
})

test('behavior: cached block number lower than the transaction block', async () => {
  const client = anvilMainnet.getClient({ cacheTime: 10_000 })
  await getBlockNumber(client)

  const hash = await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 2 })
  const transactionReceipt = await getTransactionReceipt(client, {
    hash,
  })

  expect(
    await getTransactionConfirmations(client, {
      transactionReceipt,
    }),
  ).toMatchInlineSnapshot(`2n`)
})

test('behavior: fresh block number lower than the transaction block', async () => {
  const hash = await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 1 })
  const transactionReceipt = await getTransactionReceipt(client, {
    hash,
  })

  // The receipt comes from a node that is ahead of the one returning
  // block numbers.
  expect(
    await getTransactionConfirmations(client, {
      transactionReceipt: {
        ...transactionReceipt,
        blockNumber: transactionReceipt.blockNumber + 10n,
      },
    }),
  ).toMatchInlineSnapshot(`1n`)
})

test('no confirmations', async () => {
  const hash = await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  expect(
    await getTransactionConfirmations(client, {
      hash,
    }),
  ).toBe(0n)
})
