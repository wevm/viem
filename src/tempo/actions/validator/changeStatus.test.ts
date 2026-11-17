import * as tempo from '~test/tempo.js'
import { beforeAll, describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const validator = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

beforeAll(async () => {
  await tempo.registerValidator(client, { address: validator.address })
})

describe('changeStatus', () => {
  test('default', async () => {
    const before = await Actions.validator.get(client, {
      validator: validator.address,
    })

    const { receipt } = await Actions.validator.changeStatusSync(client, {
      active: !before.active,
      validator: validator.address,
    })

    expect(receipt.status).toBe('success')

    const after = await Actions.validator.get(client, {
      validator: validator.address,
    })
    expect(after.active).toBe(!before.active)

    await Actions.validator.changeStatusSync(client, {
      active: before.active,
      validator: validator.address,
    })
  })
})
