import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { optimismClient } from '~test/src/opStack.js'
import { walletClientWithAccount } from '~test/src/utils.js'
import { depositTransaction } from './depositTransaction.js'
import { prepareDepositTransaction } from './prepareDepositTransaction.js'

test('default', async () => {
  const request = await prepareDepositTransaction(optimismClient, {
    to: accounts[1].address,
  })
  const { targetChain, ...rest } = request
  expect(targetChain).toBeDefined()
  expect(rest).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "args": {
        "data": undefined,
        "gas": 21000n,
        "isCreation": undefined,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": undefined,
      },
    }
  `)

  const hash = await depositTransaction(walletClientWithAccount, request)
  expect(hash).toBeDefined()
})
