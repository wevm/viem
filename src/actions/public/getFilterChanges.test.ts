import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'

import {
  accounts,
  initialBlockNumber,
  publicClient,
  testClient,
  transfer1Data,
  usdcAddress,
  vitalikAddress,
  walletClient,
} from '../../_test'

import {
  impersonateAccount,
  mine,
  setIntervalMining,
  stopImpersonatingAccount,
} from '../test'
import { sendTransaction } from '../wallet'
import { parseEther } from '../../utils'
import type { Hash, Log } from '../../types'
import { createBlockFilter } from './createBlockFilter'
import { createEventFilter } from './createEventFilter'
import { createPendingTransactionFilter } from './createPendingTransactionFilter'
import { getFilterChanges } from './getFilterChanges'

beforeAll(async () => {
  await setIntervalMining(testClient, { interval: 0 })
  await impersonateAccount(testClient, {
    address: vitalikAddress,
  })
})

afterAll(async () => {
  await setIntervalMining(testClient, { interval: 1 })
  await stopImpersonatingAccount(testClient, {
    address: vitalikAddress,
  })
})

test('default', async () => {
  const filter = await createPendingTransactionFilter(publicClient)
  expect(
    await getFilterChanges(publicClient, { filter }),
  ).toMatchInlineSnapshot('[]')
})

test('pending txns', async () => {
  const filter = await createPendingTransactionFilter(publicClient)

  await sendTransaction(walletClient, {
    from: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await sendTransaction(walletClient, {
    from: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  let hashes = await getFilterChanges(publicClient, { filter })
  assertType<Hash[]>(hashes)
  expect(hashes.length).toBe(2)

  mine(testClient, { blocks: 1 })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(0)

  await sendTransaction(walletClient, {
    from: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(1)
})

test('new blocks', async () => {
  const filter = await createBlockFilter(publicClient)

  await mine(testClient, { blocks: 2 })

  let hashes = await getFilterChanges(publicClient, { filter })
  assertType<Hash[]>(hashes)
  expect(hashes.length).toBe(2)

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(0)

  await mine(testClient, { blocks: 1 })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(1)
})

describe('events', () => {
  test('no args', async () => {
    const filter = await createEventFilter(publicClient)

    await sendTransaction(walletClient, {
      from: vitalikAddress,
      to: usdcAddress,
      data: transfer1Data(accounts[0].address),
    })
    await sendTransaction(walletClient, {
      from: vitalikAddress,
      to: usdcAddress,
      data: transfer1Data(accounts[1].address),
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await sendTransaction(walletClient, {
      from: vitalikAddress,
      to: usdcAddress,
      data: transfer1Data(accounts[2].address),
    })

    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
  })

  test('args: event', async () => {
    const filter = await createEventFilter(publicClient, {
      event: 'Transfer(address from, address to, uint256 value)',
    })

    await sendTransaction(walletClient, {
      from: vitalikAddress,
      to: usdcAddress,
      data: transfer1Data(accounts[0].address),
    })
    await sendTransaction(walletClient, {
      from: vitalikAddress,
      to: usdcAddress,
      data: transfer1Data(accounts[1].address),
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await sendTransaction(walletClient, {
      from: vitalikAddress,
      to: usdcAddress,
      data: transfer1Data(accounts[2].address),
    })

    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
  })

  test('args: fromBlock/toBlock', async () => {
    const filter = await createEventFilter(publicClient, {
      event: 'Transfer(address from, address to, uint256 value)',
      fromBlock: initialBlockNumber - 5n,
      toBlock: initialBlockNumber,
    })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(1056)

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)
  })
})
