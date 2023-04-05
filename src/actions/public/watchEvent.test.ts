import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { getAddress } from '../../utils/index.js'
import { wait } from '../../utils/wait.js'
import {
  accounts,
  address,
  publicClient,
  testClient,
  usdcContractConfig,
  walletClient,
} from '../../_test'
import { impersonateAccount, mine, stopImpersonatingAccount } from '../test'
import { writeContract } from '../wallet'
import * as createEventFilter from './createEventFilter'
import * as getBlockNumber from './getBlockNumber'
import * as getLogs from './getLogs'
import * as getFilterChanges from './getFilterChanges'
import type { OnLogsParameter } from './watchEvent'
import { watchEvent } from './watchEvent'

const event = {
  transfer: {
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  approval: {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
} as const

beforeAll(async () => {
  await impersonateAccount(testClient, {
    address: address.vitalik,
  })
  await impersonateAccount(testClient, {
    address: address.usdcHolder,
  })
  await mine(testClient, { blocks: 1 })
})

afterAll(async () => {
  await stopImpersonatingAccount(testClient, {
    address: address.vitalik,
  })
  await stopImpersonatingAccount(testClient, {
    address: address.usdcHolder,
  })
})

test(
  'default',
  async () => {
    const logs: OnLogsParameter[] = []

    const unwatch = watchEvent(publicClient, {
      onLogs: (logs_) => logs.push(logs_),
    })

    await wait(1000)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await wait(1000)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })
    await wait(2000)
    unwatch()

    expect(logs.length).toBe(2)
    expect(logs[0].length).toBe(2)
    expect(logs[1].length).toBe(1)
  },
  { retry: 3 },
)

test('args: batch', async () => {
  const logs: OnLogsParameter[] = []

  const unwatch = watchEvent(publicClient, {
    batch: false,
    onLogs: (logs_) => logs.push(logs_),
  })

  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.vitalik,
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.vitalik,
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
    account: address.vitalik,
  })
  await wait(2000)
  unwatch()

  expect(logs.length).toBe(3)
  expect(logs[0].length).toBe(1)
  expect(logs[1].length).toBe(1)
  expect(logs[2].length).toBe(1)
})

test('args: address', async () => {
  const logs: OnLogsParameter[] = []
  const logs2: OnLogsParameter[] = []

  const unwatch = watchEvent(publicClient, {
    address: usdcContractConfig.address,
    onLogs: (logs_) => logs.push(logs_),
  })
  const unwatch2 = watchEvent(publicClient, {
    address: '0x0000000000000000000000000000000000000000',
    onLogs: (logs_) => logs2.push(logs_),
  })

  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.vitalik,
  })
  await wait(2000)
  unwatch()
  unwatch2()

  expect(logs.length).toBe(1)
  expect(logs2.length).toBe(0)
})

test('args: address + event', async () => {
  const logs: OnLogsParameter<typeof event.transfer>[] = []
  const logs2: OnLogsParameter<typeof event.approval>[] = []

  const unwatch = watchEvent(publicClient, {
    address: usdcContractConfig.address,
    event: event.transfer,
    onLogs: (logs_) => logs.push(logs_),
  })
  const unwatch2 = watchEvent(publicClient, {
    address: usdcContractConfig.address,
    event: event.approval,
    onLogs: (logs_) => logs2.push(logs_),
  })

  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.vitalik,
  })
  await wait(2000)
  unwatch()
  unwatch2()

  expect(logs.length).toBe(1)
  expect(logs2.length).toBe(0)

  expect(logs[0][0].eventName).toEqual('Transfer')
  expect(logs[0][0].args).toEqual({
    from: getAddress(address.vitalik),
    to: getAddress(accounts[0].address),
    value: 1n,
  })
})

test.todo('args: args')

describe('`getLogs` fallback', () => {
  test(
    'falls back to `getLogs` if `createEventFilter` throws',
    async () => {
      // Something weird going on where the `getFilterChanges` spy is taking
      // results of the previous test. This `wait` fixes it. ¯\_(ツ)_/¯
      await wait(1)
      const getFilterChangesSpy = vi.spyOn(getFilterChanges, 'getFilterChanges')
      const getLogsSpy = vi.spyOn(getLogs, 'getLogs')
      vi.spyOn(createEventFilter, 'createEventFilter').mockRejectedValueOnce(
        new Error('foo'),
      )

      const logs: OnLogsParameter[] = []

      const unwatch = watchEvent(publicClient, {
        onLogs: (logs_) => logs.push(logs_),
      })

      await wait(1000)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await wait(2000)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await wait(2000)
      unwatch()

      expect(logs.length).toBe(2)
      expect(logs[0].length).toBe(2)
      expect(logs[1].length).toBe(1)
      expect(getFilterChangesSpy).toBeCalledTimes(0)
      expect(getLogsSpy).toBeCalled()
    },
    { retry: 3 },
  )

  test(
    'missed blocks',
    async () => {
      // Something weird going on where the `getFilterChanges` spy is taking
      // results of the previous test. This `wait` fixes it. ¯\_(ツ)_/¯
      await wait(1)
      const getFilterChangesSpy = vi.spyOn(getFilterChanges, 'getFilterChanges')
      const getLogsSpy = vi.spyOn(getLogs, 'getLogs')
      vi.spyOn(createEventFilter, 'createEventFilter').mockRejectedValueOnce(
        new Error('foo'),
      )

      const logs: OnLogsParameter[] = []

      const unwatch = watchEvent(publicClient, {
        onLogs: (logs_) => logs.push(logs_),
      })

      await wait(1000)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.usdcHolder,
      })
      await wait(1000)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[2].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 2 })
      await wait(1000)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[2].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[2].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 5 })
      await wait(2000)
      unwatch()

      expect(logs.length).toBe(3)
      expect(logs[0].length).toBe(2)
      expect(logs[1].length).toBe(1)
      expect(logs[2].length).toBe(2)
      expect(getFilterChangesSpy).toBeCalledTimes(0)
      expect(getLogsSpy).toBeCalled()
    },
    { retry: 3 },
  )
})

describe('errors', () => {
  test('handles error thrown from creating filter', async () => {
    vi.spyOn(getBlockNumber, 'getBlockNumber').mockRejectedValueOnce(
      new Error('foo'),
    )
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
