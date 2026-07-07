import * as tempo from '~test/tempo.js'
import * as Value from 'ox/Value'
import { beforeAll, describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const validator = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const validatorClient = tempo.getClient({
  account: validator,
  feeToken: tempo.pathUsd,
})

beforeAll(async () => {
  await tempo.registerValidator(client, { address: validator.address })
  await Actions.token.transferSync(client, {
    amount: Value.from('1', 6),
    to: validator.address,
    token: tempo.pathUsd,
  })
})

describe('update', () => {
  test('default', async () => {
    const validatorBefore = await Actions.validator.get(client, {
      validator: validator.address,
    })

    const { receipt } = await Actions.validator.updateSync(validatorClient, {
      inboundAddress: '10.0.0.1:9090',
      newValidatorAddress: validator.address,
      outboundAddress: '10.0.0.1:9090',
      publicKey:
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    })

    expect(receipt.status).toBe('success')

    const validatorAfter = await Actions.validator.get(client, {
      validator: validator.address,
    })

    expect(validatorAfter).toMatchInlineSnapshot(`
      {
        "active": true,
        "inboundAddress": "10.0.0.1:9090",
        "index": 0n,
        "outboundAddress": "10.0.0.1:9090",
        "publicKey": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "validatorAddress": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
      }
    `)
    expect(validatorAfter.index).toBe(validatorBefore.index)
    expect(validatorAfter.active).toBe(validatorBefore.active)
  })

  test('behavior: only validator can update itself', async () => {
    await expect(
      Actions.validator.update(client, {
        inboundAddress: '10.0.0.1:9090',
        newValidatorAddress: validator.address,
        outboundAddress: '10.0.0.1:9090',
        publicKey:
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      }),
    ).rejects.toThrow()
  })
})
