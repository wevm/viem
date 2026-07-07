import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const validator = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('add', () => {
  test('default', async () => {
    const initialCount = await Actions.validator.getCount(client)

    const { receipt } = await Actions.validator.addSync(client, {
      active: true,
      inboundAddress: '192.168.1.100:8080',
      newValidatorAddress: validator.address,
      outboundAddress: '192.168.1.100:8080',
      publicKey:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    })

    expect(receipt.status).toBe('success')

    const newCount = await Actions.validator.getCount(client)
    expect(newCount).toBe(initialCount + 1n)

    const result = await Actions.validator.get(client, {
      validator: validator.address,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "active": true,
        "inboundAddress": "192.168.1.100:8080",
        "index": 0n,
        "outboundAddress": "192.168.1.100:8080",
        "publicKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "validatorAddress": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
      }
    `)
  })

  test('behavior: unauthorized caller', async () => {
    await expect(
      Actions.validator.add(
        tempo.getClient({ account: account2, feeToken: tempo.pathUsd }),
        {
          active: true,
          inboundAddress: '192.168.1.100:8080',
          newValidatorAddress: '0x1234567890123456789012345678901234567890',
          outboundAddress: '192.168.1.100:8080',
          publicKey:
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        },
      ),
    ).rejects.toThrow()
  })
})
