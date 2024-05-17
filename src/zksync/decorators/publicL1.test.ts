import { afterAll, expect, test, vi } from 'vitest'

import type { Address } from 'abitype'
import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import * as readContract from '../../actions/public/readContract.js'
import { sepolia } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import { parseUnits } from '../../utils/index.js'
import type { L2TransactionRequestTwoBridgesParameters } from '../actions/requestL2TransactionTwoBridges.js'
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
      "getAllowanceL1": [Function],
      "getBalanceL1": [Function],
      "getBalanceOfTokenL1": [Function],
      "getBaseToken": [Function],
      "getErc20ContractValue": [Function],
      "getL2BridgeAddress": [Function],
      "getL2TransactionBaseCost": [Function],
      "requestL2TransactionDirect": [Function],
      "requestL2TransactionTwoBridges": [Function],
      "sharedBridge": [Function],
    }
  `)
})

test('getAllowanceL1', async () => {
  expect(
    await client.getAllowanceL1({
      bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
      account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    }),
  ).toBe(170n)

  expect(
    await clientWithAccount.getAllowanceL1({
      bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }),
  ).toBe(170n)
})

test('getBalanceOfTokenL1', async () => {
  expect(
    await client.getBalanceOfTokenL1({
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
      account: accounts[0].privateKey,
    }),
  ).toBe(170n)

  expect(
    await clientWithAccount.getBalanceOfTokenL1({
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }),
  ).toBe(170n)
})

test('getBalanceL1', async () => {
  expect(
    await client.getBalanceL1({
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
      account: accounts[0].address,
    }),
  ).toBe(170n)

  expect(await clientWithAccount.getBalanceL1({})).toBe(10n)
})

test('getBaseToken', async () => {
  expect(
    await client.getBaseToken({
      bridgehubContractAddress: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }),
  ).toBe(170n)
})

test('getErc20ContractValue', async () => {
  expect(
    await client.getErc20ContractValue({
      l1TokenAddress: '0x5C221E77624690fff6dd741493D735a17716c26B',
      functionName: 'symbol',
    }),
  ).toBe(170n)
})

test('getL2BridgeAddress', async () => {
  expect(
    await client.getL2BridgeAddress({
      bridgeAddress: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }),
  ).toBe(170n)
})

test('sharedBridge', async () => {
  expect(
    await client.sharedBridge({
      bridgehubContractAddress: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }),
  ).toBe(170n)
})

test('getL2TransactionBaseCost', async () => {
  const parameters = {
    gasPriceForEstimation: 1000000n,
    l2GasLimit: 100000n,
    gasPerPubdataByte: 800n,
    bridgehubContractAddress:
      '0x5C221E77624690fff6dd741493D735a17716c26B' as Address,
  }
  expect(await client.getL2TransactionBaseCost(parameters)).toBe(170n)
})

test('requestL2TransactionDirect', async () => {
  expect(
    await client.requestL2TransactionDirect({
      bridgehubContractAddress: '0x8E5937cE49C72264a2318163Aa96F9F973A83192',
      mintValue: parseUnits('800', 18),
      l2Contract: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
      l2Value: 1n,
      l2Calldata: '0x',
      l2GasLimit: 10000000n,
      l2GasPerPubdataByteLimit: 800n,
      factoryDeps: [],
      refundRecipient: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    }),
  ).toBe(170n)
})

test('requestL2TransactionTwoBriges', async () => {
  const parameters: L2TransactionRequestTwoBridgesParameters = {
    bridgehubContractAddress: '0x8E5937cE49C72264a2318163Aa96F9F973A83192',
    mintValue: parseUnits('800', 18),
    l2Value: 1n,
    l2GasLimit: 10000000n,
    l2GasPerPubdataByteLimit: 800n,
    refundRecipient: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    secondBridgeAddress: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    secondBridgeValue: 0n,
    secondBridgeCalldata: '0x',
  }
  expect(await client.requestL2TransactionTwoBridges(parameters)).toBe(170n)
})
