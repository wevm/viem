import { afterAll, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { sepolia } from '~viem/chains/index.js'
import { createPublicClient } from '~viem/clients/createPublicClient.js'
import { createWalletClient } from '~viem/clients/createWalletClient.js'
import { http } from '~viem/clients/transports/http.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import * as readContract from '../../actions/public/readContract.js'
import { publicActionsL1 } from './publicL1.js'

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
}).extend(publicActionsL1())

const clientWithAccount = createWalletClient({
  chain: sepolia,
  transport: http(),
  account: privateKeyToAccount(accounts[0].privateKey),
}).extend(publicActionsL1())

const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(170n)

afterAll(() => {
  spy.mockRestore()
})

test('default', async () => {
  expect(publicActionsL1()(client)).toMatchInlineSnapshot(`
    {
      "getL1Allowance": [Function],
      "getL1Balance": [Function],
      "getL1TokenBalance": [Function],
    }
  `)
})

test('getL1Allowance', async () => {
  expect(
    await client.getL1Allowance({
      bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
      account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    }),
  ).toBe(170n)

  expect(
    await clientWithAccount.getL1Allowance({
      bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }),
  ).toBe(170n)
})

test('getL1TokenBalance', async () => {
  expect(
    await client.getL1TokenBalance({
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
      account: accounts[0].privateKey,
    }),
  ).toBe(170n)

  expect(
    await clientWithAccount.getL1TokenBalance({
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }),
  ).toBe(170n)
})

test('getL1Balance', async () => {
  expect(
    await client.getL1Balance({
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
      account: accounts[0].address,
    }),
  ).toBe(170n)

  expect(await clientWithAccount.getL1Balance()).toBeDefined()
})
