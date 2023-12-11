import { describe, expect, test } from 'vitest'

import { usdcContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { optimismClient } from '~test/src/opStack.js'
import { publicActionsL2 } from './publicL2.js'

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
      "estimateL1Fee": [Function],
      "estimateL1Gas": [Function],
      "estimateTotalFee": [Function],
      "estimateTotalGas": [Function],
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
      message: {
        nonce:
          1766847064778384329583297500742918515827483896875618958121606201292619876n,
        sender: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
        target: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
        value: 69n,
        gasLimit: 21000n,
        data: '0x',
        withdrawalHash:
          '0xcc0105f5c469886957738418857b6d7ce6fec398c8a7c40045e20a0e02a1a7e7',
      },
      output: {
        outputIndex: 43877n,
        outputRoot:
          '0xe07becc7d8d944602a4f12d7f47c12754e33527076a3f7d18c316c3fc0d85b21',
        timestamp: 1702333368n,
        l2BlockNumber: 5265360n,
      },
    })
    expect(request).toBeDefined()
  })
})
