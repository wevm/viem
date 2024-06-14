import {
  assertType,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  test,
} from 'vitest'

import { ERC20InvalidTransferEvent } from '~test/contracts/generated.js'
import { usdcContractConfig } from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import { deployErc20InvalidTransferEvent } from '~test/src/utils.js'
import type { Log } from '../../types/log.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { impersonateAccount } from '../test/impersonateAccount.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { writeContract } from '../wallet/writeContract.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getBlock } from './getBlock.js'
import { getLogs } from './getLogs.js'

const client = anvilMainnet.getClient()

const event = {
  default: {
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
  approve: {
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
  unnamed: {
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
    name: 'Transfer',
    type: 'event',
  },
} as const

beforeAll(async () => {
  await impersonateAccount(client, {
    address: address.vitalik,
  })
  await impersonateAccount(client, {
    address: address.usdcHolder,
  })
  await setBalance(client, {
    address: address.usdcHolder,
    value: 10000000000000000000000n,
  })
})

test('default', async () => {
  await mine(client, { blocks: 1 })
  const logs = await getLogs(client)
  expect(logs).toMatchInlineSnapshot('[]')
})

describe('events', () => {
  test('no args', async () => {
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })
    await mine(client, { blocks: 1 })

    const logs = await getLogs(client)
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)
  })

  test('args: event', async () => {
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })
    await mine(client, { blocks: 1 })

    const logs = await getLogs(client, {
      event: event.default,
    })

    expectTypeOf(logs).toEqualTypeOf<
      Log<bigint, number, false, typeof event.default>[]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from?: `0x${string}` | undefined
      to?: `0x${string}` | undefined
      value?: bigint | undefined
    }>()

    expect(logs.length).toBe(2)
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
  })

  test('args: events', async () => {
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'approve',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await mine(client, { blocks: 1 })

    const logs = await getLogs(client, {
      events: [event.default, event.approve] as const,
    })

    expect(logs.length).toBe(2)
    expect(logs[0].eventName).toEqual('Approval')
    expect(logs[0].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
  })

  test('args: fromBlock/toBlock', async () => {
    const logs = await getLogs(client, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })
    assertType<Log<bigint, number, boolean, typeof event.default>[]>(logs)
    expect(logs.length).toBe(881)
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[0].args).toEqual({
      from: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      to: '0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8',
      value: 100000000000000000n,
    })
  })

  test('args: blockHash', async () => {
    const block = await getBlock(client, {
      blockNumber: anvilMainnet.forkBlockNumber - 1n,
    })
    const logs = await getLogs(client, {
      event: event.default,
      blockHash: block.hash!,
    })
    assertType<Log<bigint, number, boolean, typeof event.default>[]>(logs)
    expect(logs.length).toBe(86)
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[0].args).toEqual({
      from: '0x00eb6C179ebfc11D7682fc2f602169f32eAcCf78',
      to: '0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18',
      value: 7772954000000000000000000n,
    })
  })

  test('args: strict = true (named)', async () => {
    const logs = await getLogs(client, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
      strict: true,
    })

    assertType<Log<bigint, number, boolean, typeof event.default, true>[]>(logs)
    expect(logs.length).toBe(698)

    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from: `0x${string}`
      to: `0x${string}`
      value: bigint
    }>()
    expect(logs[0].args).toEqual({
      from: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      to: '0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8',
      value: 100000000000000000n,
    })

    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: strict = false (named)', async () => {
    const logs = await getLogs(client, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    assertType<Log<bigint, number, boolean, typeof event.default, false>[]>(
      logs,
    )
    expect(logs.length).toBe(881)

    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from?: `0x${string}`
      to?: `0x${string}`
      value?: bigint
    }>()
    expect(logs[0].args).toEqual({
      from: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      to: '0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8',
      value: 100000000000000000n,
    })

    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: strict = true (unnamed)', async () => {
    const logs = await getLogs(client, {
      event: event.unnamed,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
      strict: true,
    })

    assertType<Log<bigint, number, boolean, typeof event.unnamed, true>[]>(logs)
    expect(logs.length).toBe(698)

    expectTypeOf(logs[0].args).toEqualTypeOf<
      readonly [`0x${string}`, `0x${string}`, bigint]
    >()
    expect(logs[0].args).toEqual([
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      '0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8',
      100000000000000000n,
    ])

    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: strict = false (unnamed)', async () => {
    const logs = await getLogs(client, {
      event: event.unnamed,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    assertType<Log<bigint, number, boolean, typeof event.unnamed, false>[]>(
      logs,
    )
    expect(logs.length).toBe(881)

    expectTypeOf(logs[0].args).toEqualTypeOf<
      | readonly []
      | readonly [`0x${string}`, `0x${string}`, bigint]
      | readonly [`0x${string}`, `0x${string}`]
      | readonly [`0x${string}`]
    >()
    expect(logs[0].args).toEqual([
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      '0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8',
      100000000000000000n,
    ])

    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: singular `from`', async () => {
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const namedLogs = await getLogs(client, {
      event: event.default,
      args: {
        from: address.vitalik,
      },
    })
    expect(namedLogs.length).toBe(2)
    expect(namedLogs[0].eventName).toEqual('Transfer')
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(namedLogs[1].eventName).toEqual('Transfer')
    expect(namedLogs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })

    const unnamedLogs = await getLogs(client, {
      event: event.unnamed,
      args: [address.vitalik],
    })
    expect(unnamedLogs.length).toBe(2)
    expect(unnamedLogs[0].eventName).toEqual('Transfer')
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(unnamedLogs[1].eventName).toEqual('Transfer')
    expect(unnamedLogs[1].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
  })

  test('args: multiple `from`', async () => {
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const logs = await getLogs(client, {
      event: event.default,
      args: {
        from: [address.usdcHolder, address.vitalik],
      },
    })
    expect(logs.length).toBe(3)
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[2].eventName).toEqual('Transfer')
    expect(logs[2].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
  })

  test('args: singular `to`', async () => {
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const namedLogs = await getLogs(client, {
      event: event.default,
      args: {
        to: accounts[0].address,
      },
    })
    expect(namedLogs.length).toBe(1)
    expect(namedLogs[0].eventName).toEqual('Transfer')
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    const unnamedLogs = await getLogs(client, {
      event: event.unnamed,
      args: [null, accounts[0].address],
    })
    expect(unnamedLogs.length).toBe(1)
    expect(unnamedLogs[0].eventName).toEqual('Transfer')
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.usdcHolder),
      getAddress(accounts[0].address),
      1n,
    ])
  })

  test('args: multiple `to`', async () => {
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const namedLogs = await getLogs(client, {
      event: event.default,
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })
    expect(namedLogs.length).toBe(3)
    expect(namedLogs[0].eventName).toEqual('Transfer')
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(namedLogs[1].eventName).toEqual('Transfer')
    expect(namedLogs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(namedLogs[2].eventName).toEqual('Transfer')
    expect(namedLogs[2].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })

    const unnamedLogs = await getLogs(client, {
      event: event.unnamed,
      args: [null, [accounts[0].address, accounts[1].address]],
    })
    expect(unnamedLogs.length).toBe(3)
    expect(unnamedLogs[0].eventName).toEqual('Transfer')
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.usdcHolder),
      getAddress(accounts[0].address),
      1n,
    ])
    expect(unnamedLogs[1].eventName).toEqual('Transfer')
    expect(unnamedLogs[1].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(unnamedLogs[2].eventName).toEqual('Transfer')
    expect(unnamedLogs[2].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
  })

  describe('args: strict', () => {
    test('indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      await writeContract(client, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(client, { blocks: 1 })

      const strictLogs = await getLogs(client, {
        event: event.default,
        strict: true,
      })
      const looseLogs = await getLogs(client, {
        event: event.default,
      })
      expect(strictLogs.length).toBe(1)
      expect(looseLogs.length).toBe(3)
    })

    test('non-indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      await writeContract(client, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(client, { blocks: 1 })

      const strictLogs = await getLogs(client, {
        event: event.invalid,
        strict: true,
      })
      const looseLogs = await getLogs(client, {
        event: event.invalid,
      })
      expect(strictLogs.length).toBe(2)
      expect(looseLogs.length).toBe(3)
    })
  })
})
