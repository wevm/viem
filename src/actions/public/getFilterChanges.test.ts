import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'

import {
  accounts,
  address,
  initialBlockNumber,
  publicClient,
  testClient,
  walletClient,
  usdcContractConfig,
} from '../../_test/index.js'

import {
  impersonateAccount,
  mine,
  setIntervalMining,
  stopImpersonatingAccount,
} from '../test/index.js'
import { sendTransaction, writeContract } from '../wallet/index.js'
import { getAddress, parseEther } from '../../utils/index.js'
import type { Hash, Log } from '../../types/index.js'
import { createBlockFilter } from './createBlockFilter.js'
import { createEventFilter } from './createEventFilter.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'
import { createContractEventFilter } from './createContractEventFilter.js'

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
  await setIntervalMining(testClient, { interval: 0 })
  await impersonateAccount(testClient, {
    address: address.vitalik,
  })
  await impersonateAccount(testClient, {
    address: address.usdcHolder,
  })
})

afterAll(async () => {
  await setIntervalMining(testClient, { interval: 1 })
  await stopImpersonatingAccount(testClient, {
    address: address.vitalik,
  })
  await stopImpersonatingAccount(testClient, {
    address: address.usdcHolder,
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
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await sendTransaction(walletClient, {
    account: accounts[0].address,
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
    account: accounts[0].address,
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

describe('contract events', () => {
  test('no args', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
    })

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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, {
      filter,
    })

    assertType<Log<bigint, number, undefined, typeof usdcContractConfig.abi>[]>(
      logs,
    )
    expect(logs.length).toBe(3)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
    expect(logs[2].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[2].eventName).toEqual('Approval')
  })

  test('args: eventName', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
    })

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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        undefined,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
  })

  test('args: fromBlock/toBlock', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      fromBlock: initialBlockNumber - 5n,
      toBlock: initialBlockNumber,
    })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        undefined,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(1056)
  })

  test('args: singular `from`', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        from: address.vitalik,
      },
    })

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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        undefined,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: multiple `from`', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        from: [address.vitalik, address.usdcHolder],
      },
    })

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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        undefined,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
  })

  test('args: singular `to`', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        to: accounts[0].address,
      },
    })

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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        undefined,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: multiple `to`', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })

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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        undefined,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
  })
})

describe('events', () => {
  test('no args', async () => {
    const filter = await createEventFilter(publicClient)

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
      account: address.vitalik,
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
      account: address.vitalik,
    })

    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
  })

  test('args: event', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.default,
    })

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
      account: address.vitalik,
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log<bigint, number, typeof event.default>[]>(logs)
    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[2].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: fromBlock/toBlock', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.default,
      fromBlock: initialBlockNumber - 5n,
      toBlock: initialBlockNumber,
    })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log<bigint, number, typeof event.default>[]>(logs)
    expect(logs.length).toBe(1056)
    expect(logs[0].args).toEqual({
      from: '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40',
      to: '0x393ADf60012809316659Af13A3117ec22D093a38',
      value: 1162592016924672n,
    })
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: singular `from`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event: event.default,
      args: {
        from: address.vitalik,
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [address.vitalik],
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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const namedLogs = await getFilterChanges(publicClient, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(2)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(namedLogs[0].eventName).toEqual('Transfer')
    expect(namedLogs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[2].address),
      value: 1n,
    })
    expect(namedLogs[1].eventName).toEqual('Transfer')

    const unnamedLogs = await getFilterChanges(publicClient, {
      filter: unnamedFilter,
    })
    expect(unnamedLogs.length).toBe(2)
    expect(unnamedLogs.length).toBe(2)
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(unnamedLogs[0].eventName).toEqual('Transfer')
    expect(unnamedLogs[1].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[2].address),
      1n,
    ])
    expect(unnamedLogs[1].eventName).toEqual('Transfer')
  })

  test('args: multiple `from`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event: event.default,
      args: {
        from: [address.usdcHolder, address.vitalik],
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [[address.usdcHolder, address.vitalik]],
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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const namedLogs = await getFilterChanges(publicClient, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(3)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(namedLogs[0].eventName).toEqual('Transfer')
    expect(namedLogs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(namedLogs[1].eventName).toEqual('Transfer')
    expect(namedLogs[2].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(namedLogs[2].eventName).toEqual('Transfer')

    const unnamedLogs = await getFilterChanges(publicClient, {
      filter: unnamedFilter,
    })
    expect(unnamedLogs.length).toBe(3)
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.usdcHolder),
      getAddress(accounts[0].address),
      1n,
    ])
    expect(unnamedLogs[0].eventName).toEqual('Transfer')
    expect(unnamedLogs[1].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(unnamedLogs[1].eventName).toEqual('Transfer')
    expect(unnamedLogs[2].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(unnamedLogs[2].eventName).toEqual('Transfer')
  })

  test('args: singular `to`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event: event.default,
      args: {
        to: accounts[0].address,
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [null, accounts[0].address],
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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const namedLogs = await getFilterChanges(publicClient, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(1)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    const unnamedLogs = await getFilterChanges(publicClient, {
      filter: unnamedFilter,
    })
    expect(unnamedLogs.length).toBe(1)
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.usdcHolder),
      getAddress(accounts[0].address),
      1n,
    ])
  })

  test('args: multiple `to`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event: event.default,
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [null, [accounts[0].address, accounts[1].address]],
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
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const namedLogs = await getFilterChanges(publicClient, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(3)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    const unnamedLogs = await getFilterChanges(publicClient, {
      filter: unnamedFilter,
    })
    expect(unnamedLogs.length).toBe(3)
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.usdcHolder),
      getAddress(accounts[0].address),
      1n,
    ])
  })
})
