import { describe, expect, test } from 'vitest'

import { usdcContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { anvilOptimism } from '../../../test/src/anvil.js'
import { publicActionsL2 } from './publicL2.js'

const optimismClient = anvilOptimism.getClient()
const opStackClient = optimismClient.extend(publicActionsL2())

test('default', async () => {
  expect(publicActionsL2()(optimismClient)).toMatchInlineSnapshot(`
    {
      "buildDepositTransaction": [Function],
      "buildProveWithdrawal": [Function],
      "estimateContractL1Fee": [Function],
      "estimateContractL1Gas": [Function],
      "estimateContractTotalFee": [Function],
      "estimateContractTotalGas": [Function],
      "estimateInitiateWithdrawalGas": [Function],
      "estimateL1Fee": [Function],
      "estimateL1Gas": [Function],
      "estimateTotalFee": [Function],
      "estimateTotalGas": [Function],
      "getL1BaseFee": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('estimateContractL1Gas', async () => {
    const gas = await opStackClient.estimateContractL1Gas({
      ...usdcContractConfig,
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      account: '0xc8373edfad6d5c5f600b6b2507f78431c5271ff5',
      functionName: 'transfer',
      args: ['0xc8373edfad6d5c5f600b6b2507f78431c5271ff5', 1n],
    })
    expect(gas).toBeDefined()
  })

  test('estimateContractTotalGas', async () => {
    const gas = await opStackClient.estimateContractTotalGas({
      ...usdcContractConfig,
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      account: '0xc8373edfad6d5c5f600b6b2507f78431c5271ff5',
      functionName: 'transfer',
      args: ['0xc8373edfad6d5c5f600b6b2507f78431c5271ff5', 1n],
    })
    expect(gas).toBeDefined()
  })

  test('estimateContractL1Fee', async () => {
    const fee = await opStackClient.estimateContractL1Fee({
      ...usdcContractConfig,
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      account: '0xc8373edfad6d5c5f600b6b2507f78431c5271ff5',
      functionName: 'transfer',
      args: ['0xc8373edfad6d5c5f600b6b2507f78431c5271ff5', 1n],
    })
    expect(fee).toBeDefined()
  })

  test('estimateContractTotalFee', async () => {
    const fee = await opStackClient.estimateContractTotalFee({
      ...usdcContractConfig,
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      account: '0xc8373edfad6d5c5f600b6b2507f78431c5271ff5',
      functionName: 'transfer',
      args: ['0xc8373edfad6d5c5f600b6b2507f78431c5271ff5', 1n],
    })
    expect(fee).toBeDefined()
  })

  test('estimateInitiateWithdrawalGas', async () => {
    const gas = await opStackClient.estimateInitiateWithdrawalGas({
      account: accounts[0].address,
      request: {
        gas: 21000n,
        to: accounts[1].address,
      },
    })
    expect(gas).toBeDefined()
  })

  test('estimateL1Gas', async () => {
    const gas = await opStackClient.estimateL1Gas({
      account: accounts[0].address,
    })
    expect(gas).toBeDefined()
  })

  test('estimateTotalGas', async () => {
    const gas = await opStackClient.estimateTotalGas({
      account: accounts[0].address,
    })
    expect(gas).toBeDefined()
  })

  test('estimateL1Fee', async () => {
    const fee = await opStackClient.estimateL1Fee({
      account: accounts[0].address,
    })
    expect(fee).toBeDefined()
  })

  test('getL1BaseFee', async () => {
    const fee = await opStackClient.getL1BaseFee()
    expect(fee).toBeDefined()
  })

  test('estimateTotalFee', async () => {
    const fee = await opStackClient.estimateTotalFee({
      account: accounts[0].address,
    })
    expect(fee).toBeDefined()
  })

  test('buildDepositTransaction', async () => {
    const request = await opStackClient.buildDepositTransaction({
      account: accounts[0].address,
      value: 1n,
    })
    expect(request).toBeDefined()
  })

  test('buildProveWithdrawal', async () => {
    const request = await opStackClient.buildProveWithdrawal({
      withdrawal: {
        nonce:
          1766847064778384329583297500742918515827483896875618958121606201292631369n,
        sender: '0x4200000000000000000000000000000000000007',
        target: '0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1',
        value: 13000000000000000n,
        gasLimit: 287624n,
        data: '0xd764ad0b0001000000000000000000000000000000000000000000000000000000002d49000000000000000000000000420000000000000000000000000000000000001000000000000000000000000099c9fc46f92e8a1c0dec1b1747d010903e884be1000000000000000000000000000000000000000000000000002e2f6e5e148000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a41635f5fd000000000000000000000000bcce5f55dfda11600e48e91598ad0f8645466142000000000000000000000000bcce5f55dfda11600e48e91598ad0f8645466142000000000000000000000000000000000000000000000000002e2f6e5e1480000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        withdrawalHash:
          '0x178f1e0216fb50bef160eb8af7d1d98000026a84371cef4a13d8d79996cc8589',
      },
      output: {
        outputIndex: 4529n,
        outputRoot:
          '0xdc3b54fd33b5d8a60f275ca83c74b625e3942be5b70b2f7f0b9cadd869eb7b1a',
        timestamp: 1702377887n,
        l2BlockNumber: 113389063n,
      },
    })
    expect(request).toBeDefined()
  })
})
