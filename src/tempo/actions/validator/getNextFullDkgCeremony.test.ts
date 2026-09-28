import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('getNextFullDkgCeremony', () => {
  test('default', async () => {
    await expect(
      Actions.validator.getNextFullDkgCeremony(client),
    ).resolves.toMatchInlineSnapshot(`0n`)
  })
})
