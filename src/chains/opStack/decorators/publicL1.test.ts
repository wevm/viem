import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient } from '~test/src/utils.js'
import { publicActionsL1 } from './publicL1.js'

const client = publicClient.extend(publicActionsL1())

test('default', async () => {
  expect(publicActionsL1()(publicClient)).toMatchInlineSnapshot(`
    {
      "buildInitiateWithdrawal": [Function],
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
})
