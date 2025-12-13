import { beforeEach, expect, test, vi } from 'vitest'

import { anvilMainnet, anvilZksync } from '~test/src/anvil.js'
import { accounts } from '~test/src/constants.js'
import { mockRequestReturnData } from '~test/src/zksync.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import * as readContract from '../../actions/public/readContract.js'
import { sepolia } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { publicActionsL2 } from '../../zksync/decorators/publicL2.js'
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

beforeEach(() => vi.spyOn(readContract, 'readContract').mockResolvedValue(170n))

const baseClient = anvilMainnet.getClient({
  batch: { multicall: false },
  account: true,
})
baseClient.request = (async ({ method, params }) => {
  if (method === 'eth_sendTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_getTransactionCount') return 1n
  if (method === 'eth_gasPrice') return 150_000_000n
  if (method === 'eth_getBlockByNumber') return anvilMainnet.forkBlockNumber
  if (method === 'eth_chainId') return anvilMainnet.chain.id
  return anvilMainnet.getClient().request({ method, params } as any)
}) as EIP1193RequestFn
const clientL1 = baseClient.extend(publicActionsL1())

const baseZksyncClient = anvilZksync.getClient()
baseZksyncClient.request = (async ({ method, params }) => {
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_estimateGas') return 158774n
  return (
    (await mockRequestReturnData(method)) ??
    (await anvilZksync.getClient().request({ method, params } as any))
  )
}) as EIP1193RequestFn
const zksyncClient = baseZksyncClient.extend(publicActionsL2())

test('default', async () => {
  expect(publicActionsL1()(client)).toMatchInlineSnapshot(`
    {
      "getL1Allowance": [Function],
      "getL1Balance": [Function],
      "getL1TokenBalance": [Function],
      "isWithdrawalFinalized": [Function],
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

test('isWithdrawalFinalized', async () => {
  expect(
    await clientL1.isWithdrawalFinalized({
      client: zksyncClient,
      hash: '0x08ac22b6d5d048ae8a486aa41a058bb01d82bdca6489760414aa15f61f27b943',
    }),
  ).toBeDefined()
})
