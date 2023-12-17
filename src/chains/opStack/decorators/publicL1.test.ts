import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClientMainnet } from '~test/src/utils.js'
import { http, createPublicClient } from '../../../index.js'
import { optimism } from '../chains.js'
import { getWithdrawals } from '../index.js'
import { publicActionsL1 } from './publicL1.js'

const client = publicClientMainnet.extend(publicActionsL1())
const l2Client = createPublicClient({
  chain: optimism,
  transport: http(),
})

test('default', async () => {
  expect(publicActionsL1()(publicClientMainnet)).toMatchInlineSnapshot(`
    {
      "buildInitiateWithdrawal": [Function],
      "getL2Output": [Function],
      "getTimeToFinalize": [Function],
      "getTimeToNextL2Output": [Function],
      "getTimeToProve": [Function],
      "waitForNextL2Output": [Function],
      "waitToFinalize": [Function],
      "waitToProve": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('buildInitiateWithdrawal', async () => {
    const request = await client.buildInitiateWithdrawal({
      account: accounts[0].address,
      to: accounts[1].address,
      value: 1n,
    })
    expect(request).toBeDefined()
  })

  test('getL2Output', async () => {
    const request = await client.getL2Output({
      l2BlockNumber: 113365018n,
      targetChain: optimism,
    })
    expect(request).toBeDefined()
  })

  test('getTimeToNextL2Output', async () => {
    const l2BlockNumber = await l2Client.getBlockNumber()
    const request = await client.getTimeToNextL2Output({
      l2BlockNumber,
      targetChain: optimism,
    })
    expect(request).toBeDefined()
  })

  test('waitForNextL2Output', async () => {
    const request = await client.waitForNextL2Output({
      l2BlockNumber: 113365018n,
      targetChain: optimism,
    })
    expect(request).toBeDefined()
  })

  test('waitToFinalize', async () => {
    const receipt = await l2Client.getTransactionReceipt({
      hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
    })
    const [withdrawal] = getWithdrawals(receipt)
    await client.waitToFinalize({
      withdrawalHash: withdrawal.withdrawalHash,
      targetChain: optimism,
    })
  })

  test('waitToProve', async () => {
    const receipt = await l2Client.getTransactionReceipt({
      hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
    })
    const request = await client.waitToProve({
      receipt,
      targetChain: optimism,
    })
    expect(request).toBeDefined()
  })
})
