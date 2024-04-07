import { assertType, beforeAll, describe, expect, test, vi } from 'vitest'

import { ERC20InvalidTransferEvent } from '~test/contracts/generated.js'
import { usdcContractConfig } from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import {
  deployErc20InvalidTransferEvent,
  publicClient,
  testClient,
  walletClient,
  webSocketClient,
} from '~test/src/utils.js'
import type { PublicClient } from '../../clients/createPublicClient.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { wait } from '../../utils/wait.js'
import { impersonateAccount } from '../test/impersonateAccount.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { stopImpersonatingAccount } from '../test/stopImpersonatingAccount.js'
import { writeContract } from '../wallet/writeContract.js'

import { InvalidInputRpcError, RpcRequestError } from '../../index.js'
import * as createContractEventFilter from './createContractEventFilter.js'
import * as getBlockNumber from './getBlockNumber.js'
import * as getFilterChanges from './getFilterChanges.js'
import * as getLogs from './getLogs.js'
import {
  type WatchContractEventOnLogsParameter,
  watchContractEvent,
} from './watchContractEvent.js'

beforeAll(async () => {
  await impersonateAccount(testClient, {
    address: address.vitalik,
  })
  await impersonateAccount(testClient, {
    address: address.usdcHolder,
  })
  await setBalance(testClient, {
    address: address.usdcHolder,
    value: 10000000000000000000000n,
  })

  return async () => {
    await stopImpersonatingAccount(testClient, {
      address: address.vitalik,
    })
    await stopImpersonatingAccount(testClient, {
      address: address.usdcHolder,
    })
  }
})

describe('poll', () => {
  test('default', async () => {
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(publicClient, {
      abi: usdcContractConfig.abi,
      onLogs: (logs_) => {
        assertType<(typeof logs_)[0]['args']>({
          owner: '0x',
          spender: '0x',
          value: 0n,
        })
        assertType<(typeof logs_)[0]['args']>({
          from: '0x',
          to: '0x',
          value: 0n,
        })
        logs.push(logs_)
      },
      poll: true,
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
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
  })

  test('args: batch', async () => {
    const logs: WatchContractEventOnLogsParameter[] = []

    const unwatch = watchContractEvent(publicClient, {
      ...usdcContractConfig,
      batch: false,
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(3)
    expect(logs[0].length).toBe(1)
    expect(logs[1].length).toBe(1)
    expect(logs[2].length).toBe(1)
  })

  test('args: eventName', async () => {
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(publicClient, {
      ...usdcContractConfig,
      eventName: 'Transfer',
      onLogs: (logs_) => {
        assertType<(typeof logs_)[0]['args']>({
          from: '0x',
          to: '0x',
          value: 0n,
        })
        logs.push(logs_)
      },
      poll: true,
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
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
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(publicClient, {
      ...usdcContractConfig,
      eventName: 'Transfer',
      args: {
        to: accounts[0].address,
      },
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
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
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(publicClient, {
      ...usdcContractConfig,
      eventName: 'Transfer',
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
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
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(publicClient, {
      ...usdcContractConfig,
      eventName: 'Transfer',
      args: {
        from: address.usdcHolder,
      },
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
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
    const logs: WatchContractEventOnLogsParameter<typeof unnamedAbi>[] = []

    const unwatch = watchContractEvent(publicClient, {
      ...usdcContractConfig,
      abi: unnamedAbi,
      eventName: 'Transfer',
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
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

  test('args: fromBlock', async () => {
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [address.vitalik, 1n],
    })

    await mine(testClient, { blocks: 1 })
    await wait(200)
    const startBlock = await getBlockNumber.getBlockNumber(publicClient)

    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    const unwatch = watchContractEvent(publicClient, {
      abi: usdcContractConfig.abi,
      onLogs: (logs_) => {
        logs.push(logs_)
      },
      poll: true,
      fromBlock: startBlock + 1n,
    })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(2)
    expect(logs[0].length).toBe(1)
    expect(logs[1].length).toBe(1)

    expect(logs[0][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[0][0].eventName).toEqual('Transfer')
    expect(logs[1][0].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[1][0].eventName).toEqual('Approval')
  })

  describe('`getLogs` fallback', () => {
    test('falls back to `getLogs` if `createContractEventFilter` throws', async () => {
      // TODO: Something weird going on where the `getFilterChanges` spy is taking
      // results of the previous test. This `wait` fixes it. ¯\_(ツ)_/¯
      await wait(1)
      const getFilterChangesSpy = vi.spyOn(getFilterChanges, 'getFilterChanges')
      const getLogsSpy = vi.spyOn(getLogs, 'getLogs')
      vi.spyOn(
        createContractEventFilter,
        'createContractEventFilter',
      ).mockRejectedValueOnce(new Error('foo'))

      const logs: WatchContractEventOnLogsParameter[] = []

      const unwatch = watchContractEvent(publicClient, {
        abi: usdcContractConfig.abi,
        onLogs: (logs_) => logs.push(logs_),
        poll: true,
      })

      await wait(100)
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
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()

      expect(logs.length).toBe(2)
      expect(logs[0].length).toBe(2)
      expect(logs[1].length).toBe(1)
      expect(getFilterChangesSpy).toBeCalledTimes(0)
      expect(getLogsSpy).toBeCalled()
    })

    test('missed blocks', async () => {
      // TODO: Something weird going on where the `getFilterChanges` spy is taking
      // results of the previous test. This `wait` fixes it. ¯\_(ツ)_/¯
      await wait(1)
      const getFilterChangesSpy = vi.spyOn(getFilterChanges, 'getFilterChanges')
      const getLogsSpy = vi.spyOn(getLogs, 'getLogs')
      vi.spyOn(
        createContractEventFilter,
        'createContractEventFilter',
      ).mockRejectedValueOnce(new Error('foo'))

      const logs: WatchContractEventOnLogsParameter[] = []

      const unwatch = watchContractEvent(publicClient, {
        abi: usdcContractConfig.abi,
        onLogs: (logs_) => logs.push(logs_),
        poll: true,
      })

      await wait(100)
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
      await wait(200)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[2].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 2 })
      await wait(200)
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
      await wait(200)
      unwatch()

      expect(logs.length).toBe(3)
      expect(logs[0].length).toBe(2)
      expect(logs[1].length).toBe(1)
      expect(logs[2].length).toBe(2)
      expect(getFilterChangesSpy).toBeCalledTimes(0)
      expect(getLogsSpy).toBeCalled()
    })

    test('args: fromBlock', async () => {
      vi.spyOn(
        createContractEventFilter,
        'createContractEventFilter',
      ).mockRejectedValueOnce(new Error('foo'))

      const logs: WatchContractEventOnLogsParameter<
        typeof usdcContractConfig.abi
      >[] = []

      await writeContract(walletClient, {
        ...usdcContractConfig,
        account: address.vitalik,
        functionName: 'transfer',
        args: [address.vitalik, 1n],
      })

      await mine(testClient, { blocks: 1 })
      await wait(200)
      const startBlock = await getBlockNumber.getBlockNumber(publicClient)

      await writeContract(walletClient, {
        ...usdcContractConfig,
        account: address.vitalik,
        functionName: 'transfer',
        args: [address.vitalik, 1n],
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      const unwatch = watchContractEvent(publicClient, {
        abi: usdcContractConfig.abi,
        onLogs: (logs_) => {
          logs.push(logs_)
        },
        poll: true,
        fromBlock: startBlock + 1n,
      })
      await wait(200)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        account: address.vitalik,
        functionName: 'approve',
        args: [address.vitalik, 1n],
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()

      expect(logs.length).toBe(2)
      expect(logs[0].length).toBe(1)
      expect(logs[1].length).toBe(1)

      expect(logs[0][0].args).toEqual({
        from: getAddress(address.vitalik),
        to: getAddress(address.vitalik),
        value: 1n,
      })
      expect(logs[0][0].eventName).toEqual('Transfer')
      expect(logs[1][0].args).toEqual({
        owner: getAddress(address.vitalik),
        spender: getAddress(address.vitalik),
        value: 1n,
      })
      expect(logs[1][0].eventName).toEqual('Approval')
    })
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
          poll: true,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: foo]')
      unwatch()
    })

    test('handles error thrown from filter changes', async () => {
      vi.spyOn(getFilterChanges, 'getFilterChanges').mockRejectedValueOnce(
        new Error('bar'),
      )

      let unwatch: () => void = () => null
      const error = await new Promise((resolve) => {
        unwatch = watchContractEvent(publicClient, {
          ...usdcContractConfig,
          onLogs: () => null,
          onError: resolve,
          poll: true,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: bar]')
      unwatch()
    })

    test('re-initializes the filter if the active filter uninstalls', async () => {
      const filterCreator = vi.spyOn(
        createContractEventFilter,
        'createContractEventFilter',
      )

      const unwatch = watchContractEvent(publicClient, {
        ...usdcContractConfig,
        onLogs: () => null,
        onError: () => null,
        pollingInterval: 200,
        poll: true,
      })

      await wait(250)
      expect(filterCreator).toBeCalledTimes(1)

      vi.spyOn(getFilterChanges, 'getFilterChanges').mockRejectedValueOnce(
        new InvalidInputRpcError(
          new RpcRequestError({
            body: { foo: 'bar' },
            url: 'url',
            error: {
              code: -32000,
              message: 'message',
            },
          }),
        ),
      )

      await wait(500)
      expect(filterCreator).toBeCalledTimes(2)
      unwatch()
    })
  })
})

describe('subscribe', () => {
  test(
    'default',
    async () => {
      const logs: WatchContractEventOnLogsParameter<
        typeof usdcContractConfig.abi
      >[] = []

      const unwatch = watchContractEvent(webSocketClient, {
        ...usdcContractConfig,
        onLogs: (logs_) => {
          assertType<(typeof logs_)[0]['args']>({
            owner: '0x',
            spender: '0x',
            value: 0n,
          })
          assertType<(typeof logs_)[0]['args']>({
            from: '0x',
            to: '0x',
            value: 0n,
          })
          logs.push(logs_)
        },
      })

      await wait(100)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        account: address.vitalik,
        functionName: 'transfer',
        args: [address.vitalik, 1n],
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await writeContract(walletClient, {
        ...usdcContractConfig,
        account: address.vitalik,
        functionName: 'approve',
        args: [address.vitalik, 1n],
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)

      unwatch()

      expect(logs.length).toBe(2)

      expect(logs[0][0].args).toEqual({
        from: getAddress(address.vitalik),
        to: getAddress(address.vitalik),
        value: 1n,
      })
      expect(logs[0][0].eventName).toEqual('Transfer')

      expect(logs[1][0].args).toEqual({
        owner: getAddress(address.vitalik),
        spender: getAddress(address.vitalik),
        value: 1n,
      })
      expect(logs[1][0].eventName).toEqual('Approval')
    },
    { timeout: 10_000 },
  )

  test('args: eventName', async () => {
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(webSocketClient, {
      ...usdcContractConfig,
      eventName: 'Transfer',
      onLogs: (logs_) => {
        assertType<(typeof logs_)[0]['args']>({
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(2)

    expect(logs[0][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[0][0].eventName).toEqual('Transfer')
    expect(logs[1][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[1][0].eventName).toEqual('Transfer')
  })

  test('args: args', async () => {
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(webSocketClient, {
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(1)

    expect(logs[0][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0][0].eventName).toEqual('Transfer')
  })

  test('args: args', async () => {
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(webSocketClient, {
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(2)

    expect(logs[0][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0][0].eventName).toEqual('Transfer')
    expect(logs[1][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1][0].eventName).toEqual('Transfer')
  })

  test('args: args', async () => {
    const logs: WatchContractEventOnLogsParameter<
      typeof usdcContractConfig.abi
    >[] = []

    const unwatch = watchContractEvent(webSocketClient, {
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(1)

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
    const logs: WatchContractEventOnLogsParameter<typeof unnamedAbi>[] = []

    const unwatch = watchContractEvent(webSocketClient, {
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(2)

    expect(logs[0][0].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[0].address),
      1n,
    ])
    expect(logs[0][0].eventName).toEqual('Transfer')
    expect(logs[1][0].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(logs[1][0].eventName).toEqual('Transfer')
  })

  describe('args: strict', () => {
    test('indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      const logs_unstrict: WatchContractEventOnLogsParameter<
        typeof usdcContractConfig.abi,
        'Transfer'
      >[] = []
      const logs_strict: WatchContractEventOnLogsParameter<
        typeof usdcContractConfig.abi,
        'Transfer'
      >[] = []

      const unwatch_unstrict = watchContractEvent(webSocketClient, {
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        onLogs: (logs_) => logs_unstrict.push(logs_),
      })
      const unwatch_strict = watchContractEvent(webSocketClient, {
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        onLogs: (logs_) => logs_strict.push(logs_),
        strict: true,
      })

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)

      unwatch_unstrict()
      unwatch_strict()

      expect(logs_unstrict.length).toBe(3)
      expect(logs_strict.length).toBe(1)
    })

    test('non-indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      const logs_unstrict: WatchContractEventOnLogsParameter<
        typeof ERC20InvalidTransferEvent.abi,
        'Transfer'
      >[] = []
      const logs_strict: WatchContractEventOnLogsParameter<
        typeof ERC20InvalidTransferEvent.abi,
        'Transfer'
      >[] = []

      const unwatch_unstrict = watchContractEvent(webSocketClient, {
        abi: ERC20InvalidTransferEvent.abi,
        eventName: 'Transfer',
        onLogs: (logs_) => logs_unstrict.push(logs_),
      })
      const unwatch_strict = watchContractEvent(webSocketClient, {
        abi: ERC20InvalidTransferEvent.abi,
        eventName: 'Transfer',
        onLogs: (logs_) => logs_strict.push(logs_),
        strict: true,
      })

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)

      unwatch_unstrict()
      unwatch_strict()

      expect(logs_unstrict.length).toBe(3)
      expect(logs_strict.length).toBe(2)
    })
  })

  describe('errors', () => {
    test('handles error thrown on init', async () => {
      const client = {
        ...webSocketClient,
        transport: {
          ...webSocketClient.transport,
          subscribe() {
            throw new Error('error')
          },
        },
      }

      let unwatch: () => void = () => null
      const error = await new Promise((resolve) => {
        unwatch = watchContractEvent(client, {
          abi: [],
          onLogs: () => null,
          onError: resolve,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: error]')
      unwatch()
    })

    test('handles error thrown on event', async () => {
      const client = {
        ...webSocketClient,
        transport: {
          ...webSocketClient.transport,
          subscribe({ onError }: any) {
            onError(new Error('error'))
          },
        },
      }

      let unwatch: () => void = () => null
      const error = await new Promise((resolve) => {
        unwatch = watchContractEvent(client as PublicClient, {
          abi: [],
          onLogs: () => null,
          onError: resolve,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: error]')
      unwatch()
    })
  })
})
