import * as tempo from '~test/tempo.js'
import { beforeAll, describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const validator = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

beforeAll(async () => {
  await tempo.registerValidator(client, { address: validator.address })
})

describe('list', () => {
  test('default', async () => {
    await expect(Actions.validator.list(client)).resolves
      .toMatchInlineSnapshot(`
      [
        {
          "active": true,
          "inboundAddress": "192.168.1.100:8080",
          "index": 0n,
          "outboundAddress": "192.168.1.100:8080",
          "publicKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "validatorAddress": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
        },
      ]
    `)
  })
})
