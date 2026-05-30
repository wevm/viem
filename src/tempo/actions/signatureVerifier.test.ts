import { generatePrivateKey } from 'viem/accounts'
import { Account } from 'viem/tempo'
import { beforeEach, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import * as Prool from '~test/tempo/prool.js'
import * as actions from './index.js'

const account = accounts[0]
const account2 = accounts[1]

const client = getClient({
  account,
})

beforeEach(async () => {
  await Prool.restart(client)
})

describe('verifyKeychain', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const hash =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    const signature = await accessKey.sign({ hash })

    const valid = await actions.signatureVerifier.verifyKeychain(client, {
      account: account.address,
      hash,
      signature,
    })
    expect(valid).toBe(true)
  })

  test('behavior: account mismatch', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const hash =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    const signature = await accessKey.sign({ hash })

    const valid = await actions.signatureVerifier.verifyKeychain(client, {
      account: account2.address,
      hash,
      signature,
    })
    expect(valid).toBe(false)
  })

  test('behavior: unauthorized key', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const hash =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    const signature = await accessKey.sign({ hash })

    const valid = await actions.signatureVerifier.verifyKeychain(client, {
      account: account.address,
      hash,
      signature,
    })
    expect(valid).toBe(false)
  })

  test('behavior: revoked key', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })
    await actions.accessKey.revokeSync(client, { accessKey })

    const hash =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    const signature = await accessKey.sign({ hash })

    const valid = await actions.signatureVerifier.verifyKeychain(client, {
      account: account.address,
      hash,
      signature,
    })
    expect(valid).toBe(false)
  })
})

describe('verifyKeychainAdmin', () => {
  test('default', async () => {
    const adminKey = Account.fromP256(generatePrivateKey(), { access: account })
    await actions.accessKey.authorizeSync(client, {
      accessKey: adminKey,
      admin: true,
    })

    const hash =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    const signature = await adminKey.sign({ hash })

    const valid = await actions.signatureVerifier.verifyKeychainAdmin(client, {
      account: account.address,
      hash,
      signature,
    })
    expect(valid).toBe(true)
  })

  test('behavior: non-admin key returns false', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const hash =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    const signature = await accessKey.sign({ hash })

    const valid = await actions.signatureVerifier.verifyKeychainAdmin(client, {
      account: account.address,
      hash,
      signature,
    })
    expect(valid).toBe(false)
  })

  test('behavior: account mismatch', async () => {
    const adminKey = Account.fromP256(generatePrivateKey(), { access: account })
    await actions.accessKey.authorizeSync(client, {
      accessKey: adminKey,
      admin: true,
    })

    const hash =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    const signature = await adminKey.sign({ hash })

    const valid = await actions.signatureVerifier.verifyKeychainAdmin(client, {
      account: account2.address,
      hash,
      signature,
    })
    expect(valid).toBe(false)
  })
})
