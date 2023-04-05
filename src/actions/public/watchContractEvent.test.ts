import {
  afterAll,
  assertType,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
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
import * as createContractEventFilter from './createContractEventFilter'
import * as getBlockNumber from './getBlockNumber'
import * as getFilterChanges from './getFilterChanges'
import * as getLogs from './getLogs'
import type { OnLogsParameter } from './watchContractEvent'
import { watchContractEvent } from './watchContractEvent'

beforeAll(async () => {
  await impersonateAccount(testClient, {
    address: address.vitalik,
  })
  await impersonateAccount(testClient, {
    address: address.usdcHolder,
  })
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
    const logs: OnLogsParameter<typeof usdcContractConfig.abi>[] = []

    const unwatch = watchContractEvent(publicClient, {
      abi: usdcContractConfig.abi,
      onLogs: (logs_) => {
        assertType<typeof logs_[0]['args']>({
          owner: '0x',
          spender: '0x',
          value: 0n,
        })
        assertType<typeof logs_[0]['args']>({
          from: '0x',
          to: '0x',
          value: 0n,
        })
        logs.push(logs_)
      },
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [address.vitalik, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [address.vitalik, 1n],
    })
    await wait(1000)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })

    await wait(2000)
    unwatch()

    expect(logs.length).toBe(2)
    expect(logs[0].length).toBe(2)
    expect(logs[1].length).toBe(1)

    expect(logs[0][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[0][0].eventName).toEqual('Transfer')
    expect(logs[0][1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[0][1].eventName).toEqual('Transfer')
    expect(logs[1][0].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[1][0].eventName).toEqual('Approval')
  },
  { retry: 3 },
)

test('args: batch', async () => {
  const logs: OnLogsParameter[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    batch: false,
    onLogs: (logs_) => logs.push(logs_),
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [address.vitalik, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [address.vitalik, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'approve',
    args: [address.vitalik, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(3)
  expect(logs[0].length).toBe(1)
  expect(logs[1].length).toBe(1)
  expect(logs[2].length).toBe(1)
})

test('args: eventName', async () => {
  const logs: OnLogsParameter<typeof usdcContractConfig.abi>[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    eventName: 'Transfer',
    onLogs: (logs_) => {
      assertType<typeof logs_[0]['args']>({
        from: '0x',
        to: '0x',
        value: 0n,
      })
      logs.push(logs_)
    },
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [address.vitalik, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [address.vitalik, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'approve',
    args: [address.vitalik, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(2)

  expect(logs[0][0].args).toEqual({
    from: getAddress(address.vitalik),
    to: getAddress(address.vitalik),
    value: 1n,
  })
  expect(logs[0][0].eventName).toEqual('Transfer')
  expect(logs[0][1].args).toEqual({
    from: getAddress(address.vitalik),
    to: getAddress(address.vitalik),
    value: 1n,
  })
  expect(logs[0][1].eventName).toEqual('Transfer')
})

test('args: args', async () => {
  const logs: OnLogsParameter<typeof usdcContractConfig.abi>[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    eventName: 'Transfer',
    args: {
      to: accounts[0].address,
    },
    onLogs: (logs_) => logs.push(logs_),
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'approve',
    args: [address.vitalik, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(1)

  expect(logs[0][0].args).toEqual({
    from: getAddress(address.vitalik),
    to: getAddress(accounts[0].address),
    value: 1n,
  })
  expect(logs[0][0].eventName).toEqual('Transfer')
})

test('args: args', async () => {
  const logs: OnLogsParameter<typeof usdcContractConfig.abi>[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    eventName: 'Transfer',
    args: {
      to: [accounts[0].address, accounts[1].address],
    },
    onLogs: (logs_) => logs.push(logs_),
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'approve',
    args: [address.vitalik, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(2)

  expect(logs[0][0].args).toEqual({
    from: getAddress(address.vitalik),
    to: getAddress(accounts[0].address),
    value: 1n,
  })
  expect(logs[0][0].eventName).toEqual('Transfer')
  expect(logs[0][1].args).toEqual({
    from: getAddress(address.vitalik),
    to: getAddress(accounts[1].address),
    value: 1n,
  })
  expect(logs[0][1].eventName).toEqual('Transfer')
})

test('args: args', async () => {
  const logs: OnLogsParameter<typeof usdcContractConfig.abi>[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    eventName: 'Transfer',
    args: {
      from: address.usdcHolder,
    },
    onLogs: (logs_) => logs.push(logs_),
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.usdcHolder,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'approve',
    args: [address.vitalik, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(1)

  expect(logs[0][0].args).toEqual({
    from: getAddress(address.usdcHolder),
    to: getAddress(accounts[0].address),
    value: 1n,
  })
  expect(logs[0][0].eventName).toEqual('Transfer')
})

test('args: args unnamed', async () => {
  const unnamedAbi = [
    {
      type: 'event',
      name: 'Transfer',
      inputs: [
        {
          indexed: true,
          type: 'address',
        },
        {
          indexed: true,
          type: 'address',
        },
        {
          indexed: false,
          type: 'uint256',
        },
      ],
    },
  ] as const
  const logs: OnLogsParameter<typeof unnamedAbi>[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    abi: unnamedAbi,
    eventName: 'Transfer',
    onLogs: (logs_) => logs.push(logs_),
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    account: address.vitalik,
    functionName: 'approve',
    args: [address.vitalik, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(2)

  expect(logs[0][0].args).toEqual([
    getAddress(address.vitalik),
    getAddress(accounts[0].address),
    1n,
  ])
  expect(logs[0][0].eventName).toEqual('Transfer')
  expect(logs[0][1].args).toEqual([
    getAddress(address.vitalik),
    getAddress(accounts[1].address),
    1n,
  ])
  expect(logs[0][1].eventName).toEqual('Transfer')
})

describe('`getLogs` fallback', () => {
  test(
    'falls back to `getLogs` if `createContractEventFilter` throws',
    async () => {
      // TODO: Something weird going on where the `getFilterChanges` spy is taking
      // results of the previous test. This `wait` fixes it. ¯\_(ツ)_/¯
      await wait(1)
      const getFilterChangesSpy = vi.spyOn(getFilterChanges, 'getFilterChanges')
      const getLogsSpy = vi.spyOn(getLogs, 'getLogs')
      vi.spyOn(
        createContractEventFilter,
        'createContractEventFilter',
      ).mockRejectedValueOnce(new Error('foo'))

      const logs: OnLogsParameter[] = []

      const unwatch = watchContractEvent(publicClient, {
        abi: usdcContractConfig.abi,
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
      expect(getFilterChangesSpy).toBeCalledTimes(0)
      expect(getLogsSpy).toBeCalled()
    },
    { retry: 3 },
  )

  test(
    'missed blocks',
    async () => {
      // TODO: Something weird going on where the `getFilterChanges` spy is taking
      // results of the previous test. This `wait` fixes it. ¯\_(ツ)_/¯
      await wait(1)
      const getFilterChangesSpy = vi.spyOn(getFilterChanges, 'getFilterChanges')
      const getLogsSpy = vi.spyOn(getLogs, 'getLogs')
      vi.spyOn(
        createContractEventFilter,
        'createContractEventFilter',
      ).mockRejectedValueOnce(new Error('foo'))

      const logs: OnLogsParameter[] = []

      const unwatch = watchContractEvent(publicClient, {
        abi: usdcContractConfig.abi,
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
      await mine(testClient, { blocks: 1 })
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
    vi.spyOn(
      createContractEventFilter,
      'createContractEventFilter',
    ).mockRejectedValueOnce(new Error('foo'))

    let unwatch: () => void = () => null
    const error = await new Promise((resolve) => {
      unwatch = watchContractEvent(publicClient, {
        ...usdcContractConfig,
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
        unwatch = watchContractEvent(publicClient, {
          ...usdcContractConfig,
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
