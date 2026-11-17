import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

test('behavior: policy not found', async () => {
  const error = await Actions.policy
    .modifyWhitelistSync(client, {
      address: account2.address,
      allowed: true,
      policyId: 999_999n,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.policy.PolicyNotFoundError)
  const { errorName, name, policyId } = error
  expect({ errorName, name, policyId }).toMatchInlineSnapshot(`
    {
      "errorName": "PolicyNotFound",
      "name": "PolicyNotFoundError",
      "policyId": 999999n,
    }
  `)
})
