import { Hex, P256, PublicKey } from 'ox'
import { Period } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions, Scopes } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

const expiry = () => Math.floor((Date.now() + 30_000) / 1000)

test('default', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey,
    expiry: expiry(),
  })

  expect(keyAuthorization).toBeDefined()
  expect(keyAuthorization.address.toLowerCase()).toBe(
    accessKey.accessKeyAddress.toLowerCase(),
  )
})

test('behavior: format: { address, type }', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey: {
      address: accessKey.accessKeyAddress,
      type: 'p256',
    },
    expiry: expiry(),
  })

  expect(keyAuthorization.address.toLowerCase()).toBe(
    accessKey.accessKeyAddress.toLowerCase(),
  )
  expect(keyAuthorization.type).toBe('p256')
})

test('behavior: format: { publicKey, type }', async () => {
  const privateKey = P256.randomPrivateKey()
  const publicKey = P256.getPublicKey({ privateKey })
  const accessKey = Account.fromP256(privateKey, { access: account })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey: {
      publicKey: PublicKey.toHex(publicKey, { includePrefix: false }),
      type: 'p256',
    },
    expiry: expiry(),
  })

  expect(keyAuthorization.address.toLowerCase()).toBe(
    accessKey.accessKeyAddress.toLowerCase(),
  )
  expect(keyAuthorization.type).toBe('p256')
})

test('behavior: with limits', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey,
    expiry: expiry(),
    limits: [{ token: tempo.pathUsd, limit: 1000000n }],
  })

  expect(keyAuthorization.limits).toHaveLength(1)
})

test('behavior: with periodic limits', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey,
    expiry: expiry(),
    limits: [{ token: tempo.pathUsd, limit: 1000000n, period: Period.days(1) }],
  })

  expect(keyAuthorization.limits).toMatchObject([
    { token: tempo.pathUsd, limit: 1000000n, period: 86400 },
  ])
})

test('behavior: with scopes', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey,
    expiry: expiry(),
    scopes: [Scopes.tip20(tempo.pathUsd).transfer()],
  })

  expect(keyAuthorization.scopes).toMatchObject([
    { address: tempo.pathUsd, selector: '0xa9059cbb' },
  ])
})

test('behavior: with periodic limits + scopes', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey,
    expiry: expiry(),
    limits: [{ token: tempo.pathUsd, limit: 500000n, period: Period.hours(1) }],
    scopes: [{ address: tempo.pathUsd }],
  })

  expect(keyAuthorization.limits).toMatchObject([
    { token: tempo.pathUsd, limit: 500000n, period: 3600 },
  ])
  expect(keyAuthorization.scopes).toMatchObject([{ address: tempo.pathUsd }])
})

test('behavior: with witness', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  const witness = Hex.random(32)

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey,
    expiry: expiry(),
    witness,
  })

  expect(keyAuthorization.witness).toBe(witness)
})

test('behavior: admin', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account,
    accessKey,
    admin: true,
  })

  expect(keyAuthorization.isAdmin).toBe(true)
  // Admin authorizations are unrestricted.
  expect(keyAuthorization.expiry ?? undefined).toBeUndefined()
  expect(keyAuthorization.limits ?? undefined).toBeUndefined()
  expect(keyAuthorization.scopes ?? undefined).toBeUndefined()
})
