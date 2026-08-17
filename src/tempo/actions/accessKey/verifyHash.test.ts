import { P256 } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

const hash =
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const

test('default', async () => {
  const adminKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  await Actions.accessKey.authorizeSync(client, {
    accessKey: adminKey,
    admin: true,
  })

  const signature = await adminKey.sign({ hash })

  const valid = await Actions.accessKey.verifyHash(client, {
    account: account.address,
    hash,
    signature,
  })
  expect(valid).toBe(true)
})

test('behavior: non-admin key returns false by default', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  await Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Math.floor((Date.now() + 30_000) / 1000),
  })

  const signature = await accessKey.sign({ hash })

  const valid = await Actions.accessKey.verifyHash(client, {
    account: account.address,
    hash,
    signature,
  })
  expect(valid).toBe(false)
})

test('behavior: admin: false accepts any active access key', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  await Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Math.floor((Date.now() + 30_000) / 1000),
  })

  const signature = await accessKey.sign({ hash })

  const valid = await Actions.accessKey.verifyHash(client, {
    account: account.address,
    admin: false,
    hash,
    signature,
  })
  expect(valid).toBe(true)
})

test('behavior: account mismatch', async () => {
  const adminKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  await Actions.accessKey.authorizeSync(client, {
    accessKey: adminKey,
    admin: true,
  })

  const signature = await adminKey.sign({ hash })

  const valid = await Actions.accessKey.verifyHash(client, {
    account: account2.address,
    hash,
    signature,
  })
  expect(valid).toBe(false)
})

test('behavior: unauthorized key', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const signature = await accessKey.sign({ hash })

  const valid = await Actions.accessKey.verifyHash(client, {
    account: account.address,
    admin: false,
    hash,
    signature,
  })
  expect(valid).toBe(false)
})

test('behavior: revoked key', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  await Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Math.floor((Date.now() + 30_000) / 1000),
  })
  await Actions.accessKey.revokeSync(client, { accessKey })

  const signature = await accessKey.sign({ hash })

  const valid = await Actions.accessKey.verifyHash(client, {
    account: account.address,
    admin: false,
    hash,
    signature,
  })
  expect(valid).toBe(false)
})
