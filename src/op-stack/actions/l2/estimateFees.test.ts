import { Abi } from 'ox'
import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: optimism,
  transport: http(anvil.optimism.rpcUrl.http),
})
const request = {
  account: constants.accounts[0].address,
  to: constants.accounts[1].address,
  value: 1n,
} as const
const transfer = {
  abi: Abi.from([
    'function transfer(address recipient, uint256 amount) returns (bool)',
  ]),
  account: '0xc8373edfad6d5c5f600b6b2507f78431c5271ff5',
  address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  args: ['0xc8373edfad6d5c5f600b6b2507f78431c5271ff5', 1n],
  functionName: 'transfer',
} as const

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.optimism.forkBlockNumber,
    jsonRpcUrl: optimism.rpcUrls.http,
  })
}, 30_000)

test('getL1BaseFee', async () => {
  const fee = await Actions.l2.getL1BaseFee(client)
  expect(fee).toBeGreaterThan(0n)
})

test('estimateL1Fee', async () => {
  const fee = await Actions.l2.estimateL1Fee(client, request)
  expect(fee).toBeGreaterThan(0n)
})

test('estimateL1Gas', async () => {
  const gas = await Actions.l2.estimateL1Gas(client, request)
  expect(gas).toBeGreaterThan(0n)
})

test('estimateOperatorFee', async () => {
  const fee = await Actions.l2.estimateOperatorFee(client, request)
  expect(fee).toMatchInlineSnapshot(`0n`)
})

test('estimateTotalFee', async () => {
  const fee = await Actions.l2.estimateTotalFee(client, request)
  expect(fee).toBeGreaterThan(0n)
})

test('estimateTotalGas', async () => {
  const gas = await Actions.l2.estimateTotalGas(client, request)
  expect(gas).toBeGreaterThan(0n)
})

test('estimate contract fees', async () => {
  const estimates = await Promise.all([
    Actions.l2.estimateContractL1Fee(client, transfer),
    Actions.l2.estimateContractL1Gas(client, transfer),
    Actions.l2.estimateContractTotalFee(client, transfer),
    Actions.l2.estimateContractTotalGas(client, transfer),
  ])

  expect(estimates.every((estimate) => estimate > 0n)).toMatchInlineSnapshot(
    `true`,
  )
})

test('wraps contract fee errors', async () => {
  const options = {
    ...transfer,
    gasPriceOracleAddress: '0x0000000000000000000000000000000000000000',
  } as const
  const results = await Promise.allSettled([
    Actions.l2.estimateContractL1Fee(client, options),
    Actions.l2.estimateContractL1Gas(client, options),
    Actions.l2.estimateContractTotalFee(client, options),
    Actions.l2.estimateContractTotalGas(client, options),
  ])

  expect(
    results.map((result) =>
      result.status === 'rejected' ? result.reason.name : undefined,
    ),
  ).toMatchInlineSnapshot(`
    [
      "ContractFunctionExecutionError",
      "ContractFunctionExecutionError",
      "ContractFunctionExecutionError",
      "ContractFunctionExecutionError",
    ]
  `)
})

test('estimateInitiateWithdrawalGas', async () => {
  const gas = await Actions.l2.estimateInitiateWithdrawalGas(client, {
    account: constants.accounts[0].address,
    request: {
      gas: 21_000n,
      to: constants.accounts[1].address,
    },
  })

  expect(gas).toBeGreaterThan(0n)
})
