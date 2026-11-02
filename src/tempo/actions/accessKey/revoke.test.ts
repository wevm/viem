import { P256 } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

test('default', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  await Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Math.floor((Date.now() + 30_000) / 1000),
  })

  const { receipt, ...result } = await Actions.accessKey.revokeSync(client, {
    accessKey,
  })

  expect(receipt.status).toBe('success')
  expect(result.publicKey.toLowerCase()).toBe(
    accessKey.accessKeyAddress.toLowerCase(),
  )

  // Verify key is revoked.
  const key = await Actions.accessKey.getMetadata(client, {
    account: account.address,
    accessKey,
  })
  expect(key.isRevoked).toBe(true)
})
