import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { walletClient } from '~test/src/utils.js'
import { base } from '../chains.js'
import { walletActionsL1 } from './walletL1.js'

const opStackClient = walletClient.extend(walletActionsL1())

test('default', async () => {
  expect(walletActionsL1()(walletClient)).toMatchInlineSnapshot(`
    {
      "depositTransaction": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('depositTransaction', async () => {
    const gas = await opStackClient.depositTransaction({
      account: accounts[0].address,
      args: {
        gas: 21_000n,
        to: accounts[1].address,
      },
      targetChain: base,
    })
    expect(gas).toBeDefined()
  })
})
