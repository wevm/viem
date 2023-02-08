import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { wait } from '../../utils/wait'
import {
  accounts,
  publicClient,
  testClient,
  usdcContractConfig,
  vitalikAddress,
  walletClient,
} from '../../_test'
import { impersonateAccount, stopImpersonatingAccount } from '../test'
import { writeContract } from '../wallet'
import * as createContractEventFilter from './createContractEventFilter'
import * as getFilterChanges from './getFilterChanges'
import { OnLogsResponse, watchContractEvent } from './watchContractEvent'

beforeAll(async () => {
  await impersonateAccount(testClient, {
    address: vitalikAddress,
  })
  await impersonateAccount(testClient, {
    address: '0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078',
  })
})

afterAll(async () => {
  await stopImpersonatingAccount(testClient, {
    address: vitalikAddress,
  })
  await stopImpersonatingAccount(testClient, {
    address: '0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078',
  })
})

test(
  'default',
  async () => {
    let logs: OnLogsResponse[] = []

    const unwatch = watchContractEvent(publicClient, {
      ...usdcContractConfig,
      onLogs: (logs_) => logs.push(logs_),
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: vitalikAddress,
      functionName: 'transfer',
      args: [vitalikAddress, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: vitalikAddress,
      functionName: 'transfer',
      args: [vitalikAddress, 1n],
    })
    await wait(1000)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: vitalikAddress,
      functionName: 'approve',
      args: [vitalikAddress, 1n],
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
  let logs: OnLogsResponse[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    batch: false,
    onLogs: (logs_) => logs.push(logs_),
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'transfer',
    args: [vitalikAddress, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'transfer',
    args: [vitalikAddress, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'approve',
    args: [vitalikAddress, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(3)
  expect(logs[0].length).toBe(1)
  expect(logs[1].length).toBe(1)
  expect(logs[2].length).toBe(1)
})

test('args: eventName', async () => {
  let logs: OnLogsResponse[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    eventName: 'Transfer',
    onLogs: (logs_) => logs.push(logs_),
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'transfer',
    args: [vitalikAddress, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'transfer',
    args: [vitalikAddress, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'approve',
    args: [vitalikAddress, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(2)
})

test('args: args', async () => {
  let logs: OnLogsResponse[] = []

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
    from: vitalikAddress,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'approve',
    args: [vitalikAddress, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(1)
})

test('args: args', async () => {
  let logs: OnLogsResponse[] = []

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
    from: vitalikAddress,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'approve',
    args: [vitalikAddress, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(2)
})

test('args: args', async () => {
  let logs: OnLogsResponse[] = []

  const unwatch = watchContractEvent(publicClient, {
    ...usdcContractConfig,
    eventName: 'Transfer',
    args: {
      from: '0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078',
    },
    onLogs: (logs_) => logs.push(logs_),
  })

  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: '0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078',
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
  })
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
  })
  await wait(1000)
  await writeContract(walletClient, {
    ...usdcContractConfig,
    from: vitalikAddress,
    functionName: 'approve',
    args: [vitalikAddress, 1n],
  })

  await wait(2000)
  unwatch()

  expect(logs.length).toBe(1)
  expect(logs[0].length).toBe(1)
})

describe('errors', () => {
  test('handles error thrown from creating filter', async () => {
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
