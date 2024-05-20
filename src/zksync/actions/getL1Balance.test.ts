import { afterAll, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'

import * as readContract from '../../actions/public/readContract.js'
import { sepolia } from '../../chains/index.js'
import { erc20Abi } from '../../constants/abis.js'
import { http, createClient, createPublicClient } from '../../index.js'
import { getL1Balance } from './getL1Balance.js'

const sourceAccount = accounts[0]
const tokenL1 = '0x5C221E77624690fff6dd741493D735a17716c26B'
const account = privateKeyToAccount(sourceAccount.privateKey)
const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(170n)

afterAll(() => {
  spy.mockRestore()
})

test('default with account hoisting and token', async () => {
  const client = createClient({
    chain: sepolia,
    transport: http(),
    account,
  })

  expect(
    await getL1Balance(client, {
      token: tokenL1,
    }),
  ).toBeDefined()

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: tokenL1,
    functionName: 'balanceOf',
    args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    blockTag: undefined,
  })
})

test('args: blockTag with account hoisting and token', async () => {
  const client = createClient({
    chain: sepolia,
    transport: http(),
    account,
  })

  expect(
    await getL1Balance(client, {
      token: tokenL1,
      blockTag: 'finalized',
    }),
  ).toBe(170n)

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: tokenL1,
    functionName: 'balanceOf',
    args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    blockTag: 'finalized',
  })
})

test('default with account provided to the method and token', async () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  })

  expect(
    await getL1Balance(client, {
      token: tokenL1,
      account,
    }),
  ).toBe(170n)

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: tokenL1,
    functionName: 'balanceOf',
    args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    blockTag: undefined,
  })
})

test('args: blockTag with account provided to the method and token', async () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  })

  expect(
    await getL1Balance(client, {
      token: tokenL1,
      account,
      blockTag: 'finalized',
    }),
  ).toBe(170n)

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: tokenL1,
    functionName: 'balanceOf',
    args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    blockTag: 'finalized',
  })
})

test('default with account hoisting', async () => {
  const client = createClient({
    chain: sepolia,
    transport: http(),
    account,
  })

  expect(await getL1Balance(client)).toBeDefined()
})

test('args: blockTag with account hoisting', async () => {
  const client = createClient({
    chain: sepolia,
    transport: http(),
    account,
  })

  expect(
    await getL1Balance(client, {
      blockTag: 'finalized',
    }),
  ).toBeDefined()
})

test('default with account provided to the method', async () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  })

  expect(
    await getL1Balance(client, {
      account,
    }),
  ).toBeDefined()
})

test('args: blockTag with account provided to the method', async () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  })

  expect(
    await getL1Balance(client, {
      account,
      blockTag: 'finalized',
    }),
  ).toBeDefined()
})
