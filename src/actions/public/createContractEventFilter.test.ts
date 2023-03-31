import { assertType, expect, test } from 'vitest'

import {
  accounts,
  initialBlockNumber,
  publicClient,
  usdcContractConfig,
} from '../../_test/index.js'

import { createContractEventFilter } from './createContractEventFilter.js'

test('default', async () => {
  const filter = await createContractEventFilter(publicClient, {
    abi: usdcContractConfig.abi,
  })
  assertType<typeof filter>({
    abi: usdcContractConfig.abi,
    id: '0x',
    type: 'event',
    args: undefined,
    eventName: undefined,
  })
  expect(filter.id).toBeDefined()
  expect(filter.type).toBe('event')
  expect(filter.args).toBeUndefined()
  expect(filter.eventName).toBeUndefined()
})

test('args: address', async () => {
  const filter = await createContractEventFilter(publicClient, {
    address: usdcContractConfig.address,
    abi: usdcContractConfig.abi,
  })
  expect(filter.id).toBeDefined()
})

test('args: args', async () => {
  const filter = await createContractEventFilter(publicClient, {
    address: usdcContractConfig.address,
    abi: usdcContractConfig.abi,
    eventName: 'Transfer',
    args: {
      from: accounts[0].address,
      to: accounts[0].address,
    },
  })
  expect(filter.abi).toEqual(usdcContractConfig.abi)
  expect(filter.args).toEqual({
    from: accounts[0].address,
    to: accounts[0].address,
  })
  expect(filter.eventName).toEqual('Transfer')

  const filter2 = await createContractEventFilter(publicClient, {
    address: usdcContractConfig.address,
    abi: usdcContractConfig.abi,
    eventName: 'Transfer',
    args: {
      from: accounts[0].address,
    },
  })
  expect(filter.abi).toEqual(usdcContractConfig.abi)
  expect(filter2.args).toEqual({
    from: accounts[0].address,
  })
  expect(filter.eventName).toEqual('Transfer')

  const filter3 = await createContractEventFilter(publicClient, {
    address: usdcContractConfig.address,
    abi: usdcContractConfig.abi,
    eventName: 'Transfer',
    args: {
      to: [accounts[0].address, accounts[1].address],
    },
  })
  expect(filter.abi).toEqual(usdcContractConfig.abi)
  expect(filter3.args).toEqual({
    to: [accounts[0].address, accounts[1].address],
  })
  expect(filter3.eventName).toEqual('Transfer')
})

test('args: fromBlock', async () => {
  expect(
    (
      await createContractEventFilter(publicClient, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        fromBlock: 'latest',
      })
    ).id,
  ).toBeDefined()
  expect(
    (
      await createContractEventFilter(publicClient, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        fromBlock: initialBlockNumber,
      })
    ).id,
  ).toBeDefined()
})

test('args: toBlock', async () => {
  expect(
    (
      await createContractEventFilter(publicClient, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        toBlock: 'latest',
      })
    ).id,
  ).toBeDefined()
  expect(
    (
      await createContractEventFilter(publicClient, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        toBlock: initialBlockNumber,
      })
    ).id,
  ).toBeDefined()
})
