import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const validator = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('getValidatorToken', () => {
  test('default', async () => {
    // Non-validator addresses resolve to the default fee token (pathUSD).
    await expect(
      Actions.fee.getValidatorToken(client, {
        validator: account.address,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000000",
        "id": 0n,
      }
    `)
  })

  test('behavior: query registered validator', async () => {
    await tempo.registerValidator(client, { address: validator.address })

    // Registered validators without a preference resolve to pathUSD.
    await expect(
      Actions.fee.getValidatorToken(client, {
        validator: validator.address,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000000",
        "id": 0n,
      }
    `)
  })
})
