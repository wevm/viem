import { expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { getBalance } from './getBalance.js'
import { getBlock } from './getBlock.js'
import { getBlockNumber } from './getBlockNumber.js'

const client = anvilMainnet.getClient()
const batchClient = anvilMainnet.getClient({
  batch: { multicall: true },
})

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(client, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await mine(client, { blocks: 1 })
  await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 1 })
  await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('2'),
  })
  await mine(client, { blocks: 1 })
  await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('3'),
  })
  await mine(client, { blocks: 1 })
}

test('gets balance', async () => {
  await setup()
  expect(
    await getBalance(client, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('gets balance at latest', async () => {
  await setup()
  expect(
    await getBalance(client, {
      address: targetAccount.address,
      blockTag: 'latest',
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('gets balance at block number', async () => {
  await setup()
  const currentBlockNumber = await getBlockNumber(client)
  expect(
    await getBalance(client, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber,
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
  expect(
    await getBalance(client, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 1n,
    }),
  ).toMatchInlineSnapshot('10003000000000000000000n')
  expect(
    await getBalance(client, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 2n,
    }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(client, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 3n,
    }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
})

test('batch: gets balance via multicall', async () => {
  await setup()
  const balance = await getBalance(batchClient, {
    address: targetAccount.address,
  })
  expect(balance).toMatchInlineSnapshot('10006000000000000000000n')
})

test('batch: batches multiple getBalance calls', async () => {
  await setup()
  const [balance1, balance2] = await Promise.all([
    getBalance(batchClient, { address: targetAccount.address }),
    getBalance(batchClient, { address: sourceAccount.address }),
  ])
  expect(balance1).toBeGreaterThan(0n)
  expect(balance2).toBeGreaterThan(0n)
})

test('gets balance at block hash (EIP-1898)', async () => {
  await setup()
  const currentBlockNumber = await getBlockNumber(client)
  const block = await getBlock(client, { blockNumber: currentBlockNumber })
  const prevBlock = await getBlock(client, {
    blockNumber: currentBlockNumber - 1n,
  })

  expect(
    await getBalance(client, {
      address: targetAccount.address,
      blockHash: block.hash!,
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')

  expect(
    await getBalance(client, {
      address: targetAccount.address,
      blockHash: prevBlock.hash!,
    }),
  ).toMatchInlineSnapshot('10003000000000000000000n')
})

test('gets balance at block hash with requireCanonical (EIP-1898)', async () => {
  await setup()
  const currentBlockNumber = await getBlockNumber(client)
  const block = await getBlock(client, { blockNumber: currentBlockNumber })

  expect(
    await getBalance(client, {
      address: targetAccount.address,
      blockHash: block.hash!,
      requireCanonical: true,
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('error: requireCanonical without blockHash', async () => {
  await expect(
    getBalance(client, {
      address: targetAccount.address,
      blockTag: 'latest',
      requireCanonical: true,
    } as never),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [BaseError: \`requireCanonical\` can only be provided when \`blockHash\` is set.

    Version: viem@x.y.z]
  `,
  )
})
