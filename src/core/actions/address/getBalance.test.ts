import { expect, test } from 'vitest'

import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

// WETH contract on mainnet (large, stable balance at the fork block).
const weth = '0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const wethBalance = 2578764282569393454844437n

test('default', async () => {
  expect(await Actions.address.getBalance(client, { address: weth })).toBe(
    wethBalance,
  )
})

test('args: blockNumber', async () => {
  expect(
    await Actions.address.getBalance(client, {
      address: weth,
      blockNumber: anvil.mainnet.forkBlockNumber,
    }),
  ).toBe(wethBalance)
})

test('args: blockTag', async () => {
  expect(
    await Actions.address.getBalance(client, {
      address: weth,
      blockTag: 'latest',
    }),
  ).toBe(wethBalance)
})

test('behavior: zero balance', async () => {
  expect(
    await Actions.address.getBalance(client, {
      address: '0xCafEcAfeCAFECAfECaFeCaFECafECafECafECaFe',
    }),
  ).toBe(0n)
})

test('args: blockHash (EIP-1898)', async () => {
  const block = await Actions.block.get(client, { blockTag: 'latest' })
  expect(
    await Actions.address.getBalance(client, {
      address: weth,
      blockHash: block.hash!,
    }),
  ).toBe(wethBalance)
})

test('batch: routes through multicall3', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  expect(await Actions.address.getBalance(batchClient, { address: weth })).toBe(
    wethBalance,
  )
})

test('batch: args blockNumber', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  expect(
    await Actions.address.getBalance(batchClient, {
      address: weth,
      blockNumber: anvil.mainnet.forkBlockNumber,
    }),
  ).toBe(wethBalance)
})

test('batch: deployless multicall', async () => {
  const batchClient = Client.create({
    batch: { multicall: { deployless: true } },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  expect(await Actions.address.getBalance(batchClient, { address: weth })).toBe(
    wethBalance,
  )
})

test('batch: no multicall3 falls back to direct request', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  expect(await Actions.address.getBalance(batchClient, { address: weth })).toBe(
    wethBalance,
  )
})
