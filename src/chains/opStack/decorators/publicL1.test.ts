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
      "getSecondsToNextL2Output": [Function],
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

  test('getSecondsToNextL2Output', async () => {
    const l2BlockNumber = await l2Client.getBlockNumber()
    const request = await client.getSecondsToNextL2Output({
      l2BlockNumber,
      targetChain: optimism,
    })
    expect(request).toBeDefined()
  })
})
