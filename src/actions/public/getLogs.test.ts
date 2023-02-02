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
import type { Log } from '../../types'
import { getLogs } from './getLogs'
import { getBlock } from './getBlock'

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
  const logs = await getLogs(publicClient)
  expect(logs).toMatchInlineSnapshot('[]')
})

describe('events', () => {
  test('no args', async () => {
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

    let logs = await getLogs(publicClient)
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)
  })

  test('args: fromBlock/toBlock', async () => {
    let logs = await getLogs(publicClient, {
      event: 'Transfer(address from, address to, uint256 value)',
      fromBlock: initialBlockNumber - 5n,
      toBlock: initialBlockNumber,
    })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(1056)
  })

  test('args: blockHash', async () => {
    const block = await getBlock(publicClient, {
      blockNumber: initialBlockNumber - 1n,
    })
    let logs = await getLogs(publicClient, {
      event: 'Transfer(address from, address to, uint256 value)',
      blockHash: block.hash!,
    })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(118)
  })
})
