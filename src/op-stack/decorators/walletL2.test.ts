import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { walletActionsL2 } from './walletL2.js'

const client = anvilMainnet.getClient()
const opStackClient = client.extend(walletActionsL2())

test('default', async () => {
  expect(walletActionsL2()(client)).toMatchInlineSnapshot(`
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
