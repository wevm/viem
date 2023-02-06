import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { wait } from '../../utils/wait'
import {
  accounts,
  publicClient,
  testClient,
  transfer1Data,
  usdcContractConfig,
  vitalikAddress,
  walletClient,
} from '../../_test'
import { impersonateAccount, stopImpersonatingAccount } from '../test'
import { sendTransaction } from '../wallet'
import * as createEventFilter from './createEventFilter'
import * as getFilterChanges from './getFilterChanges'
import { OnLogsResponse, watchEvent } from './watchEvent'

beforeAll(async () => {
  await impersonateAccount(testClient, {
    address: vitalikAddress,
  })
})

afterAll(async () => {
  await stopImpersonatingAccount(testClient, {
    address: vitalikAddress,
  })
})

test('default', async () => {
  let logs: OnLogsResponse[] = []

  const unwatch = watchEvent(publicClient, {
    onLogs: (logs_) => logs.push(logs_),
  })

  await wait(1000)
  await sendTransaction(walletClient, {
    from: vitalikAddress,
    to: usdcContractConfig.address,
    data: transfer1Data(accounts[0].address),
  })
  await sendTransaction(walletClient, {
    from: vitalikAddress,
    to: usdcContractConfig.address,
    data: transfer1Data(accounts[0].address),
  })
  await wait(1000)
  await sendTransaction(walletClient, {
    from: vitalikAddress,
    to: usdcContractConfig.address,
    data: transfer1Data(accounts[1].address),
  })
  await wait(2000)
  unwatch()

  expect(logs.length).toBe(2)
  expect(logs[0].length).toBe(2)
  expect(logs[1].length).toBe(1)
})

test('args: batch', async () => {
  let logs: OnLogsResponse[] = []

  const unwatch = watchEvent(publicClient, {
    batch: false,
    onLogs: (logs_) => logs.push(logs_),
  })

  await wait(1000)
  await sendTransaction(walletClient, {
    from: vitalikAddress,
    to: usdcContractConfig.address,
    data: transfer1Data(accounts[0].address),
  })
  await sendTransaction(walletClient, {
    from: vitalikAddress,
    to: usdcContractConfig.address,
    data: transfer1Data(accounts[0].address),
  })
  await wait(1000)
  await sendTransaction(walletClient, {
    from: vitalikAddress,
    to: usdcContractConfig.address,
    data: transfer1Data(accounts[1].address),
  })
  await wait(2000)
  unwatch()

  expect(logs.length).toBe(3)
  expect(logs[0].length).toBe(1)
  expect(logs[1].length).toBe(1)
  expect(logs[2].length).toBe(1)
})

test('args: address', async () => {
  let logs: OnLogsResponse[] = []
  let logs2: OnLogsResponse[] = []

  const unwatch = watchEvent(publicClient, {
    address: usdcContractConfig.address,
    onLogs: (logs_) => logs.push(logs_),
  })
  const unwatch2 = watchEvent(publicClient, {
    address: '0x0000000000000000000000000000000000000000',
    onLogs: (logs_) => logs2.push(logs_),
  })

  await wait(1000)
  await sendTransaction(walletClient, {
    from: vitalikAddress,
    to: usdcContractConfig.address,
    data: transfer1Data(accounts[0].address),
  })
  await wait(2000)
  unwatch()
  unwatch2()

  expect(logs.length).toBe(1)
  expect(logs2.length).toBe(0)
})

test('args: address + event', async () => {
  let logs: OnLogsResponse[] = []
  let logs2: OnLogsResponse[] = []

  const unwatch = watchEvent(publicClient, {
    address: usdcContractConfig.address,
    event: 'Transfer(address indexed, address indexed, uint256 indexed)',
    onLogs: (logs_) => logs.push(logs_),
  })
  const unwatch2 = watchEvent(publicClient, {
    address: usdcContractConfig.address,
    event: 'Approval(address indexed, address indexed)',
    onLogs: (logs_) => logs2.push(logs_),
  })

  await wait(1000)
  await sendTransaction(walletClient, {
    from: vitalikAddress,
    to: usdcContractConfig.address,
    data: transfer1Data(accounts[0].address),
  })
  await wait(2000)
  unwatch()
  unwatch2()

  expect(logs.length).toBe(1)
  expect(logs2.length).toBe(0)
})

test.todo('args: args')

describe('errors', () => {
  test('handles error thrown from creating filter', async () => {
    vi.spyOn(createEventFilter, 'createEventFilter').mockRejectedValueOnce(
      new Error('foo'),
    )

    let unwatch: () => void = () => null
    const error = await new Promise((resolve) => {
      unwatch = watchEvent(publicClient, {
        onLogs: () => null,
        onError: resolve,
      })
    })
    expect(error).toMatchInlineSnapshot('[Error: foo]')
    unwatch()
  })

  test(
    'handles error thrown from filter changes',
    async () => {
      vi.spyOn(getFilterChanges, 'getFilterChanges').mockRejectedValueOnce(
        new Error('bar'),
      )

      let unwatch: () => void = () => null
      const error = await new Promise((resolve) => {
        unwatch = watchEvent(publicClient, {
          onLogs: () => null,
          onError: resolve,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: bar]')
      unwatch()
    },
    { retry: 3 },
  )
})
