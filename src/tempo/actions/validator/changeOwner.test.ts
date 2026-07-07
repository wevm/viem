import * as tempo from '~test/tempo.js'
import * as Value from 'ox/Value'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })

describe('changeOwner', () => {
  test('default', async () => {
    const { receipt } = await Actions.validator.changeOwnerSync(client, {
      newOwner: account2.address,
    })

    expect(receipt.status).toBe('success')

    await expect(
      Actions.validator.getOwner(client),
    ).resolves.toMatchInlineSnapshot(
      `"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"`,
    )

    await Actions.token.transferSync(client, {
      amount: Value.from('1', 6),
      to: account2.address,
      token: tempo.pathUsd,
    })

    await Actions.validator.changeOwnerSync(client2, {
      newOwner: account.address,
    })

    await expect(
      Actions.validator.getOwner(client),
    ).resolves.toMatchInlineSnapshot(
      `"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`,
    )
  })
})
