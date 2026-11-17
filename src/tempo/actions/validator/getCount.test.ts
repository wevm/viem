import * as tempo from '~test/tempo.js'
import { beforeAll, describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const validator = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

beforeAll(async () => {
  await tempo.registerValidator(client, { address: validator.address })
})

describe('getCount', () => {
  test('default', async () => {
    await expect(
      Actions.validator.getCount(client),
    ).resolves.toMatchInlineSnapshot(`1n`)
  })

  test('behavior: count matches validators array length', async () => {
    const count = await Actions.validator.getCount(client)
    const validators = await Actions.validator.list(client)

    expect(count).toBe(BigInt(validators.length))
  })
})
