import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const receiverAccount = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const receiverClient = tempo.getClient({
  account: receiverAccount,
  feeToken: tempo.pathUsd,
})

describe('validate', () => {
  test('behavior: allowed when no policy', async () => {
    const result = await Actions.receivePolicy.validate(client, {
      receiver: Account.fromSecp256k1(tempo.accounts[3]!.privateKey).address,
      sender: account.address,
      token: tempo.alphaUsd,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "authorized": true,
        "blockedReason": "none",
      }
    `)
  })

  test('behavior: blocked by sender policy', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'reject-all',
    })

    const result = await Actions.receivePolicy.validate(client, {
      receiver: receiverAccount.address,
      sender: account.address,
      token: tempo.alphaUsd,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "authorized": false,
        "blockedReason": "receivePolicy",
      }
    `)
  })
})
