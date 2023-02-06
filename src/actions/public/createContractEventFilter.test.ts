import { expect, test } from 'vitest'

import {
  accounts,
  initialBlockNumber,
  publicClient,
  usdcContractConfig,
} from '../../_test'

import { createContractEventFilter } from './createContractEventFilter'

test('default', async () => {
  expect(
    (
      await createContractEventFilter(publicClient, {
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
      })
    ).id,
  ).toBeDefined()
})

test('args: address', async () => {
  expect(
    (
      await createContractEventFilter(publicClient, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
      })
    ).id,
  ).toBeDefined()
})

test('args: args', async () => {
  expect(
    (
      await createContractEventFilter(publicClient, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        args: {
          from: accounts[0].address,
          to: accounts[0].address,
        },
      })
    ).id,
  ).toBeDefined()
  expect(
    (
      await createContractEventFilter(publicClient, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        args: {
          from: accounts[0].address,
        },
      })
    ).id,
  ).toBeDefined()
  expect(
    (
      await createContractEventFilter(publicClient, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        args: {
          to: [accounts[0].address, accounts[1].address],
        },
      })
    ).id,
  ).toBeDefined()
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
