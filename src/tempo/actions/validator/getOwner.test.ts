import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('getOwner', () => {
  test('default', async () => {
    await expect(
      Actions.validator.getOwner(client),
    ).resolves.toMatchInlineSnapshot(
      `"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`,
    )
  })
})
