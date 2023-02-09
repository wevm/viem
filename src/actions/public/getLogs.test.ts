import { afterAll, assertType, beforeAll, describe, expect, test } from 'vitest'

import {
  accounts,
  address,
  initialBlockNumber,
  publicClient,
  testClient,
  transfer1Data,
  usdcContractConfig,
  walletClient,
} from '../../_test'

import {
  impersonateAccount,
  mine,
  setIntervalMining,
  stopImpersonatingAccount,
} from '../test'
import { sendTransaction, writeContract } from '../wallet'
import type { Log } from '../../types'
import { getLogs } from './getLogs'
import { getBlock } from './getBlock'

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
  await impersonateAccount(testClient, {
    address: address.usdcHolder,
  })
})

test('default', async () => {
  const logs = await getLogs(publicClient)
  expect(logs).toMatchInlineSnapshot('[]')
})

describe('events', () => {
  test('no args', async () => {
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

    let logs = await getLogs(publicClient)
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)
  })

  test('args: event', async () => {
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

    let logs = await getLogs(publicClient, {
      event: 'Transfer(address from, address to, uint256 value)',
    })
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

  test('args: singular `from`', async () => {
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
      (
        await getLogs(publicClient, {
          event:
            'Transfer(address indexed from, address indexed to, uint256 value)',
          args: {
            from: address.vitalik,
          },
        })
      ).length,
    ).toBe(2)
    expect(
      (
        await getLogs(publicClient, {
          event: 'Transfer(address indexed, address indexed, uint256)',
          args: [address.vitalik],
        })
      ).length,
    ).toBe(2)
  })

  test('args: multiple `from`', async () => {
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
      (
        await getLogs(publicClient, {
          event:
            'Transfer(address indexed from, address indexed to, uint256 value)',
          args: {
            from: [address.usdcHolder, address.vitalik],
          },
        })
      ).length,
    ).toBe(3)
    expect(
      (
        await getLogs(publicClient, {
          event:
            'Transfer(address indexed from, address indexed to, uint256 value)',
          args: {
            from: [address.usdcHolder, address.vitalik],
          },
        })
      ).length,
    ).toBe(3)
  })

  test('args: singular `to`', async () => {
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
      (
        await getLogs(publicClient, {
          event:
            'Transfer(address indexed from, address indexed to, uint256 value)',
          args: {
            to: accounts[0].address,
          },
        })
      ).length,
    ).toBe(1)
    expect(
      (
        await getLogs(publicClient, {
          event: 'Transfer(address indexed, address indexed, uint256)',
          args: [null, accounts[0].address],
        })
      ).length,
    ).toBe(1)
  })

  test('args: multiple `to`', async () => {
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
      (
        await getLogs(publicClient, {
          event:
            'Transfer(address indexed from, address indexed to, uint256 value)',
          args: {
            to: [accounts[0].address, accounts[1].address],
          },
        })
      ).length,
    ).toBe(3)
    expect(
      (
        await getLogs(publicClient, {
          event: 'Transfer(address indexed, address indexed, uint256)',
          args: [null, [accounts[0].address, accounts[1].address]],
        })
      ).length,
    ).toBe(3)
  })
})
