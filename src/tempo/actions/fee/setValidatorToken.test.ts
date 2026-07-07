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
    amount: Value.from('100', 6),
    to: validator.address,
    token: tempo.pathUsd,
  })
})

describe('setValidatorToken', () => {
  test('default', async () => {
    const { receipt, ...result } = await Actions.fee.setValidatorTokenSync(
      validatorClient,
      {
        token: '0x20c0000000000000000000000000000000000001',
      },
    )

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "token": "0x20C0000000000000000000000000000000000001",
        "validator": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
      }
    `)

    await expect(
      Actions.fee.getValidatorToken(client, {
        validator: validator.address,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000001",
        "id": 1n,
      }
    `)
  })

  test('behavior: set token by id', async () => {
    const { receipt, ...result } = await Actions.fee.setValidatorTokenSync(
      validatorClient,
      {
        token: 2n,
      },
    )

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "token": "0x20C0000000000000000000000000000000000002",
        "validator": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
      }
    `)

    await expect(
      Actions.fee.getValidatorToken(client, {
        validator: validator.address,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000002",
        "id": 2n,
      }
    `)
  })
})
