import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('setNextFullDkgCeremony', () => {
  test('default', async () => {
    const initialEpoch = await Actions.validator.getNextFullDkgCeremony(client)
    const newEpoch = initialEpoch + 100n

    const { receipt } = await Actions.validator.setNextFullDkgCeremonySync(
      client,
      {
        epoch: newEpoch,
      },
    )

    expect(receipt.status).toBe('success')

    await expect(
      Actions.validator.getNextFullDkgCeremony(client),
    ).resolves.toMatchInlineSnapshot(`100n`)
  })
})
