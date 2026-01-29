import { beforeAll, expect, test } from 'vitest'

import {
  daiContractConfig,
  erc20Abi,
  usdcContractConfig,
} from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import { impersonateAccount } from '../test/impersonateAccount.js'
import { mine } from '../test/mine.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getAddress } from '../../index.js'
import { setBalance, writeContract } from '../index.js'
import { getContractEvents } from './getContractEvents.js'

const client = anvilMainnet.getClient()

beforeAll(async () => {
  await impersonateAccount(client, {
    address: address.usdcHolder,
  })
  await impersonateAccount(client, {
    address: address.daiHolder,
  })
  await setBalance(client, {
    address: address.usdcHolder,
    value: 10000000000000000000000n,
  })
  await setBalance(client, {
    address: address.daiHolder,
    value: 10000000000000000000000n,
  })
})

test('default', async () => {
  await mine(client, { blocks: 1 })
  const logs = await getContractEvents(client, {
    abi: erc20Abi,
  })
  expect(logs).toMatchInlineSnapshot('[]')
})

test('args: address', async () => {
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.usdcHolder,
  })
  await writeContract(client, {
    ...daiContractConfig,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
    account: address.daiHolder,
  })
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'approve',
    args: [accounts[1].address, 1n],
    account: address.usdcHolder,
  })
  await mine(client, { blocks: 1 })

  const logs = await getContractEvents(client, {
    address: usdcContractConfig.address,
    abi: erc20Abi,
  })
  expect(logs.length).toBe(2)
  expect(logs[0].eventName).toEqual('Transfer')
  expect(logs[0].args).toEqual({
    from: getAddress(address.usdcHolder),
    to: getAddress(accounts[0].address),
    value: 1n,
  })
  expect(logs[1].eventName).toEqual('Approval')
  expect(logs[1].args).toEqual({
    owner: getAddress(address.usdcHolder),
    spender: getAddress(accounts[1].address),
    value: 1n,
  })
})

test('args: abi', async () => {
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.usdcHolder,
  })
  await writeContract(client, {
    ...daiContractConfig,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
    account: address.daiHolder,
  })
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'approve',
    args: [accounts[1].address, 1n],
    account: address.usdcHolder,
  })
  await mine(client, { blocks: 1 })

  const logs = await getContractEvents(client, {
    abi: erc20Abi,
  })
  expect(logs.length).toBe(3)
})

test('args: args', async () => {
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.usdcHolder,
  })
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
    account: address.usdcHolder,
  })
  await writeContract(client, {
    ...daiContractConfig,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
    account: address.daiHolder,
  })
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'approve',
    args: [accounts[1].address, 1n],
    account: address.usdcHolder,
  })
  await mine(client, { blocks: 1 })

  const logs = await getContractEvents(client, {
    abi: erc20Abi,
    args: {
      from: address.daiHolder,
      to: accounts[1].address,
    },
  })
  expect(logs.length).toBe(1)
  expect(logs[0].eventName).toEqual('Transfer')
  expect(logs[0].args).toEqual({
    from: getAddress(address.daiHolder),
    to: getAddress(accounts[1].address),
    value: 1n,
  })
})

test('args: eventName', async () => {
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.usdcHolder,
  })
  await writeContract(client, {
    ...daiContractConfig,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
    account: address.daiHolder,
  })
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'approve',
    args: [accounts[1].address, 1n],
    account: address.usdcHolder,
  })
  await mine(client, { blocks: 1 })

  const logs = await getContractEvents(client, {
    abi: usdcContractConfig.abi,
    eventName: 'Transfer',
  })
  expect(logs.length).toBe(2)
  expect(logs[0].eventName).toEqual('Transfer')
  expect(logs[0].args).toEqual({
    from: getAddress(address.usdcHolder),
    to: getAddress(accounts[0].address),
    value: 1n,
  })
  expect(logs[1].eventName).toEqual('Transfer')
  expect(logs[1].args).toEqual({
    from: getAddress(address.daiHolder),
    to: getAddress(accounts[1].address),
    value: 1n,
  })
})

test('args: eventName + args', async () => {
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'transfer',
    args: [accounts[0].address, 1n],
    account: address.usdcHolder,
  })
  await writeContract(client, {
    ...daiContractConfig,
    functionName: 'transfer',
    args: [accounts[1].address, 1n],
    account: address.daiHolder,
  })
  await writeContract(client, {
    ...usdcContractConfig,
    functionName: 'approve',
    args: [accounts[1].address, 1n],
    account: address.usdcHolder,
  })
  await mine(client, { blocks: 1 })

  const logs = await getContractEvents(client, {
    abi: erc20Abi,
    eventName: 'Transfer',
    args: {
      to: accounts[1].address,
    },
  })
  expect(logs.length).toBe(1)
  expect(logs[0].eventName).toEqual('Transfer')
  expect(logs[0].args).toEqual({
    from: getAddress(address.daiHolder),
    to: getAddress(accounts[1].address),
    value: 1n,
  })
})
