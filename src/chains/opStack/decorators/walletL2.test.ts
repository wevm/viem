import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { walletClient } from '~test/src/utils.js'
import { walletActionsL2 } from './walletL2.js'

const opStackClient = walletClient.extend(walletActionsL2())

test('default', async () => {
  expect(walletActionsL2()(walletClient)).toMatchInlineSnapshot(`
    {
      "initiateWithdrawal": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('initiateWithdrawal', async () => {
    const hash = await opStackClient.initiateWithdrawal({
      account: accounts[0].address,
      request: {
        gas: 21_000n,
        to: accounts[1].address,
        value: 1n,
      },
    })
    expect(hash).toBeDefined()
  })
})
