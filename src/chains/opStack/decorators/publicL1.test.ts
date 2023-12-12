import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClientMainnet } from '~test/src/utils.js'
import { http, createPublicClient } from '../../../index.js'
import { optimism } from '../chains.js'
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
      "getTimeToNextL2Output": [Function],
      "waitForL2Output": [Function],
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

  test('waitForL2Output', async () => {
    const request = await client.waitForL2Output({
      l2BlockNumber: 113365018n,
      targetChain: optimism,
    })
    expect(request).toBeDefined()
  })
})
