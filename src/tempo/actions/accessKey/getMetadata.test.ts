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

  const key = await Actions.accessKey.getMetadata(client, {
    account: account.address,
    accessKey,
  })

  expect(key.address.toLowerCase()).toBe(
    accessKey.accessKeyAddress.toLowerCase(),
  )
  expect(key.keyType).toBe('p256')
  expect(key.spendPolicy).toBe('unlimited')
  expect(key.isRevoked).toBe(false)
})

test('behavior: non-existent key', async () => {
  const key = await Actions.accessKey.getMetadata(client, {
    account: account.address,
    accessKey: '0x0000000000000000000000000000000000000001',
  })

  expect(key).toMatchInlineSnapshot(`
    {
      "address": "0x0000000000000000000000000000000000000000",
      "expiry": 0n,
      "isRevoked": false,
      "keyType": "secp256k1",
      "spendPolicy": "unlimited",
    }
  `)
})
