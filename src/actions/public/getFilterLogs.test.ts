import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'

import {
  accounts,
  address,
  initialBlockNumber,
  publicClient,
  testClient,
  transfer1Data,
  usdcContractConfig,
  walletClient,
} from '../../_test'

import {
  impersonateAccount,
  mine,
  setIntervalMining,
  stopImpersonatingAccount,
} from '../test'
import { sendTransaction } from '../wallet'
import type { Log } from '../../types'
import { createEventFilter } from './createEventFilter'
import { getFilterLogs } from './getFilterLogs'

beforeAll(async () => {
  await setIntervalMining(testClient, { interval: 0 })
  await impersonateAccount(testClient, {
    address: address.vitalik,
  })
})

afterAll(async () => {
  await setIntervalMining(testClient, { interval: 1 })
  await stopImpersonatingAccount(testClient, {
    address: address.vitalik,
  })
})

test('default', async () => {
  const filter = await createEventFilter(publicClient)
  expect(await getFilterLogs(publicClient, { filter })).toMatchInlineSnapshot(
    '[]',
  )
})

describe('events', () => {
  test('no args', async () => {
    const filter = await createEventFilter(publicClient)

    await sendTransaction(walletClient, {
      from: address.vitalik,
      to: usdcContractConfig.address,
      data: transfer1Data(accounts[0].address),
    })
    await sendTransaction(walletClient, {
      from: address.vitalik,
      to: usdcContractConfig.address,
      data: transfer1Data(accounts[1].address),
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterLogs(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)
  })

  test('args: event', async () => {
    const filter = await createEventFilter(publicClient, {
      event: 'Transfer(address from, address to, uint256 value)',
    })

    await sendTransaction(walletClient, {
      from: address.vitalik,
      to: usdcContractConfig.address,
      data: transfer1Data(accounts[0].address),
    })
    await sendTransaction(walletClient, {
      from: address.vitalik,
      to: usdcContractConfig.address,
      data: transfer1Data(accounts[1].address),
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterLogs(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)
  })

  test('args: fromBlock/toBlock', async () => {
    const filter = await createEventFilter(publicClient, {
      event: 'Transfer(address from, address to, uint256 value)',
      fromBlock: initialBlockNumber - 5n,
      toBlock: initialBlockNumber,
    })

    let logs = await getFilterLogs(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(1056)
  })

  test.todo('args: args')
})
