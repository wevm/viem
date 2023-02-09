import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'

import {
  accounts,
  address,
  initialBlockNumber,
  publicClient,
  testClient,
  transfer1Data,
  walletClient,
  usdcContractConfig,
} from '../../_test'

import {
  impersonateAccount,
  mine,
  setIntervalMining,
  stopImpersonatingAccount,
} from '../test'
import { sendTransaction, writeContract } from '../wallet'
import { parseEther } from '../../utils'
import type { Hash, Log } from '../../types'
import { createBlockFilter } from './createBlockFilter'
import { createEventFilter } from './createEventFilter'
import { createPendingTransactionFilter } from './createPendingTransactionFilter'
import { getFilterChanges } from './getFilterChanges'

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
    from: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await sendTransaction(walletClient, {
    from: accounts[0].address,
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
    from: accounts[0].address,
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

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await sendTransaction(walletClient, {
      from: address.vitalik,
      to: usdcContractConfig.address,
      data: transfer1Data(accounts[2].address),
    })

    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
  })

  test('args: event', async () => {
    const filter = await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
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

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await sendTransaction(walletClient, {
      from: address.vitalik,
      to: usdcContractConfig.address,
      data: transfer1Data(accounts[2].address),
    })

    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
  })

  test('args: fromBlock/toBlock', async () => {
    const filter = await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
      fromBlock: initialBlockNumber - 5n,
      toBlock: initialBlockNumber,
    })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(1056)

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: singular `from`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
      args: {
        from: address.vitalik,
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      args: [address.vitalik],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    expect(
      (await getFilterChanges(publicClient, { filter: namedFilter })).length,
    ).toBe(2)
    expect(
      (await getFilterChanges(publicClient, { filter: unnamedFilter })).length,
    ).toBe(2)
  })

  test('args: multiple `from`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
      args: {
        from: [address.usdcHolder, address.vitalik],
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      args: [[address.usdcHolder, address.vitalik]],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    expect(
      (await getFilterChanges(publicClient, { filter: namedFilter })).length,
    ).toBe(3)
    expect(
      (await getFilterChanges(publicClient, { filter: unnamedFilter })).length,
    ).toBe(3)
  })

  test('args: singular `to`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
      args: {
        to: accounts[0].address,
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      args: [null, accounts[0].address],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    expect(
      (await getFilterChanges(publicClient, { filter: namedFilter })).length,
    ).toBe(1)
    expect(
      (await getFilterChanges(publicClient, { filter: unnamedFilter })).length,
    ).toBe(1)
  })

  test('args: multiple `to`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      args: [null, [accounts[0].address, accounts[1].address]],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      from: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    expect(
      (await getFilterChanges(publicClient, { filter: namedFilter })).length,
    ).toBe(3)
    expect(
      (await getFilterChanges(publicClient, { filter: unnamedFilter })).length,
    ).toBe(3)
  })
})
