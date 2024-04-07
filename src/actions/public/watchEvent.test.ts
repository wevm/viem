import { beforeAll, describe, expect, test, vi } from 'vitest'

import { ERC20InvalidTransferEvent } from '~test/contracts/generated.js'
import { usdcContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import {
  deployErc20InvalidTransferEvent,
  publicClient,
  testClient,
  walletClient,
  webSocketClient,
} from '~test/src/utils.js'

import type { PublicClient } from '../../index.js'
import { InvalidInputRpcError, RpcRequestError } from '../../index.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { wait } from '../../utils/wait.js'
import { impersonateAccount } from '../test/impersonateAccount.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { stopImpersonatingAccount } from '../test/stopImpersonatingAccount.js'
import { writeContract } from '../wallet/writeContract.js'
import * as createEventFilter from './createEventFilter.js'
import * as getBlockNumber from './getBlockNumber.js'
import * as getFilterChanges from './getFilterChanges.js'
import * as getLogs from './getLogs.js'
import { type WatchEventOnLogsParameter, watchEvent } from './watchEvent.js'

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
  invalid: {
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
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
} as const

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
  await mine(testClient, { blocks: 1 })

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
    const logs: WatchEventOnLogsParameter[] = []

    const unwatch = watchEvent(publicClient, {
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
    })

    await wait(200)
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
  })

  test('args: batch', async () => {
    const logs: WatchEventOnLogsParameter[] = []

    const unwatch = watchEvent(publicClient, {
      batch: false,
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
    })

    await wait(200)
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

    expect(logs.length).toBe(3)
    expect(logs[0].length).toBe(1)
    expect(logs[1].length).toBe(1)
    expect(logs[2].length).toBe(1)
  })

  test('args: address', async () => {
    const logs: WatchEventOnLogsParameter[] = []
    const logs2: WatchEventOnLogsParameter[] = []

    const unwatch = watchEvent(publicClient, {
      address: usdcContractConfig.address,
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
    })
    const unwatch2 = watchEvent(publicClient, {
      address: '0x0000000000000000000000000000000000000000',
      onLogs: (logs_) => logs2.push(logs_),
      poll: true,
    })

    await wait(200)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()
    unwatch2()

    expect(logs.length).toBe(1)
    expect(logs2.length).toBe(0)
  })

  test('args: address + event', async () => {
    const logs: WatchEventOnLogsParameter<typeof event.transfer>[] = []
    const logs2: WatchEventOnLogsParameter<typeof event.approval>[] = []

    const unwatch = watchEvent(publicClient, {
      address: usdcContractConfig.address,
      event: event.transfer,
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
    })
    const unwatch2 = watchEvent(publicClient, {
      address: usdcContractConfig.address,
      event: event.approval,
      onLogs: (logs_) => logs2.push(logs_),
      poll: true,
    })

    await wait(100)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
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

  test('args: address + events', async () => {
    const logs: WatchEventOnLogsParameter<
      undefined,
      [typeof event.transfer, typeof event.approval]
    >[] = []

    const unwatch = watchEvent(publicClient, {
      address: usdcContractConfig.address,
      events: [event.transfer, event.approval],
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
      functionName: 'approve',
      args: [accounts[1].address, 2n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(1)
    expect(logs[0].length).toBe(2)

    expect(logs[0][0].eventName).toEqual('Transfer')
    expect(logs[0][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    expect(logs[0][1].eventName).toEqual('Approval')
    expect(logs[0][1].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(accounts[1].address),
      value: 2n,
    })
  })

  test('args: events', async () => {
    const logs: WatchEventOnLogsParameter<
      undefined,
      [typeof event.transfer, typeof event.approval]
    >[] = []

    const unwatch = watchEvent(publicClient, {
      events: [event.transfer, event.approval],
      onLogs: (logs_) => logs.push(logs_),
      poll: true,
    })

    await wait(100)
    await writeContract(walletClient, {
      ...wagmiContractConfig,
      functionName: 'mint',
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'approve',
      args: [accounts[1].address, 2n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(1)
    expect(logs[0].length).toBe(2)

    expect(logs[0][0].eventName).toEqual('Transfer')
    expect(logs[0][0].args).toEqual({
      from: address.burn,
      to: getAddress(address.vitalik),
    })

    expect(logs[0][1].eventName).toEqual('Approval')
    expect(logs[0][1].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(accounts[1].address),
      value: 2n,
    })
  })

  test('args: fromBlock', async () => {
    const logs: WatchEventOnLogsParameter<
      undefined,
      [typeof event.transfer, typeof event.approval]
    >[] = []

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'approve',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })

    await mine(testClient, { blocks: 1 })
    await wait(200)

    const startBlock = await getBlockNumber.getBlockNumber(publicClient)

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'approve',
      args: [accounts[1].address, 2n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)

    const unwatch = watchEvent(publicClient, {
      address: usdcContractConfig.address,
      events: [event.transfer, event.approval],
      onLogs: (logs_) => logs.push(logs_),
      fromBlock: startBlock + 1n,
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'approve',
      args: [accounts[1].address, 3n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.flat().length).toBe(2)
  })

  test.todo('args: args')

  describe('`getLogs` fallback', () => {
    test('falls back to `getLogs` if `createEventFilter` throws', async () => {
      // Something weird going on where the `getFilterChanges` spy is taking
      // results of the previous test. This `wait` fixes it. ¯\_(ツ)_/¯
      await wait(1)
      const getFilterChangesSpy = vi.spyOn(getFilterChanges, 'getFilterChanges')
      const getLogsSpy = vi.spyOn(getLogs, 'getLogs')
      vi.spyOn(createEventFilter, 'createEventFilter').mockRejectedValueOnce(
        new Error('foo'),
      )

      const logs: WatchEventOnLogsParameter[] = []

      const unwatch = watchEvent(publicClient, {
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
      // Something weird going on where the `getFilterChanges` spy is taking
      // results of the previous test. This `wait` fixes it. ¯\_(ツ)_/¯
      await wait(1)
      const getFilterChangesSpy = vi.spyOn(getFilterChanges, 'getFilterChanges')
      const getLogsSpy = vi.spyOn(getLogs, 'getLogs')
      vi.spyOn(createEventFilter, 'createEventFilter').mockRejectedValueOnce(
        new Error('foo'),
      )

      const logs: WatchEventOnLogsParameter[] = []

      const unwatch = watchEvent(publicClient, {
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
      await wait(1)
      vi.spyOn(createEventFilter, 'createEventFilter').mockRejectedValueOnce(
        new Error('foo'),
      )

      const logs: WatchEventOnLogsParameter<
        undefined,
        [typeof event.transfer, typeof event.approval]
      >[] = []

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'approve',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })

      await mine(testClient, { blocks: 1 })
      await wait(200)

      const startBlock = await getBlockNumber.getBlockNumber(publicClient)

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'approve',
        args: [accounts[1].address, 2n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)

      const unwatch = watchEvent(publicClient, {
        address: usdcContractConfig.address,
        events: [event.transfer, event.approval],
        onLogs: (logs_) => logs.push(logs_),
        fromBlock: startBlock + 1n,
      })

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'approve',
        args: [accounts[1].address, 3n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()

      expect(logs.flat().length).toBe(2)
    })
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
        unwatch = watchEvent(publicClient, {
          onLogs: () => null,
          onError: resolve,
          poll: true,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: bar]')
      unwatch()
    })

    test('re-initializes the filter if the active filter uninstalls', async () => {
      const filterCreator = vi.spyOn(createEventFilter, 'createEventFilter')

      const unwatch = watchEvent(publicClient, {
        ...usdcContractConfig,
        onLogs: () => null,
        onError: () => null,
        poll: true,
        pollingInterval: 200,
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
  test('default', async () => {
    const logs: WatchEventOnLogsParameter[] = []

    const unwatch = watchEvent(webSocketClient, {
      onLogs: (logs_) => logs.push(logs_),
    })

    await wait(100)
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
  })

  test('args: address', async () => {
    const logs: WatchEventOnLogsParameter[] = []
    const logs2: WatchEventOnLogsParameter[] = []

    const unwatch = watchEvent(webSocketClient, {
      address: usdcContractConfig.address,
      onLogs: (logs_) => logs.push(logs_),
    })
    const unwatch2 = watchEvent(webSocketClient, {
      address: '0x0000000000000000000000000000000000000000',
      onLogs: (logs_) => logs2.push(logs_),
    })

    await wait(100)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()
    unwatch2()

    expect(logs.length).toBe(1)
    expect(logs2.length).toBe(0)
  })

  test('args: address + event', async () => {
    const logs: WatchEventOnLogsParameter<typeof event.transfer>[] = []
    const logs2: WatchEventOnLogsParameter<typeof event.approval>[] = []

    const unwatch = watchEvent(webSocketClient, {
      address: usdcContractConfig.address,
      event: event.transfer,
      onLogs: (logs_) => logs.push(logs_),
    })
    const unwatch2 = watchEvent(webSocketClient, {
      address: usdcContractConfig.address,
      event: event.approval,
      onLogs: (logs_) => logs2.push(logs_),
    })

    await wait(100)
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
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

  test('args: address + events', async () => {
    const logs: WatchEventOnLogsParameter<
      undefined,
      [typeof event.transfer, typeof event.approval]
    >[] = []

    const unwatch = watchEvent(webSocketClient, {
      address: usdcContractConfig.address,
      events: [event.transfer, event.approval],
      onLogs: (logs_) => logs.push(logs_),
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
      functionName: 'approve',
      args: [accounts[1].address, 2n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()

    expect(logs.length).toBe(2)

    expect(logs[0][0].eventName).toEqual('Transfer')
    expect(logs[0][0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    expect(logs[1][0].eventName).toEqual('Approval')
    expect(logs[1][0].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(accounts[1].address),
      value: 2n,
    })
  })

  test(
    'args: events',
    async () => {
      const logs: WatchEventOnLogsParameter<
        undefined,
        [typeof event.transfer, typeof event.approval]
      >[] = []

      const unwatch = watchEvent(webSocketClient, {
        events: [event.transfer, event.approval],
        onLogs: (logs_) => logs.push(logs_),
      })

      await wait(100)
      await writeContract(walletClient, {
        ...wagmiContractConfig,
        functionName: 'mint',
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'approve',
        args: [accounts[1].address, 2n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()

      expect(logs.length).toBe(2)

      expect(logs[0][0].eventName).toEqual('Transfer')
      expect(logs[0][0].args).toEqual({
        from: address.burn,
        to: getAddress(address.vitalik),
      })

      expect(logs[1][0].eventName).toEqual('Approval')
      expect(logs[1][0].args).toEqual({
        owner: getAddress(address.vitalik),
        spender: getAddress(accounts[1].address),
        value: 2n,
      })
    },
    { timeout: 10_000 },
  )

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
        unwatch = watchEvent(client, {
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
        unwatch = watchEvent(client as PublicClient, {
          onLogs: () => null,
          onError: resolve,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: error]')
      unwatch()
    })

    describe('args: strict', () => {
      test('indexed params mismatch', async () => {
        const { contractAddress } = await deployErc20InvalidTransferEvent()

        const logs_unstrict: WatchEventOnLogsParameter<
          typeof event.transfer
        >[] = []
        const logs_strict: WatchEventOnLogsParameter<typeof event.transfer>[] =
          []

        const unwatch_unstrict = watchEvent(webSocketClient, {
          event: event.transfer,
          onLogs: (logs_) => logs_unstrict.push(logs_),
        })
        const unwatch_strict = watchEvent(webSocketClient, {
          event: event.transfer,
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

        const logs_unstrict: WatchEventOnLogsParameter<typeof event.invalid>[] =
          []
        const logs_strict: WatchEventOnLogsParameter<typeof event.invalid>[] =
          []

        const unwatch_unstrict = watchEvent(webSocketClient, {
          event: event.invalid,
          onLogs: (logs_) => logs_unstrict.push(logs_),
        })
        const unwatch_strict = watchEvent(webSocketClient, {
          event: event.invalid,
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
  })
})
