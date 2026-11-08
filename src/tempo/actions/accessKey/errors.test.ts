import { P256 } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

import { wait } from '../../../core/internal/wait.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const to = '0x000000000000000000000000000000000000dEaD'

/** Authorizes an access key with the given limits and scopes and returns it. */
async function setupAccessKey(
  options: Pick<Actions.accessKey.authorize.Args, 'limits' | 'scopes'> = {},
) {
  const { limits, scopes } = options
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  await Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Math.floor((Date.now() + 30_000) / 1000),
    limits,
    scopes,
  })
  return accessKey
}

test('behavior: spending limit exceeded by the call', async () => {
  const accessKey = await setupAccessKey({
    limits: [{ token: tempo.pathUsd, limit: 5_000_000n }],
  })

  const error = await Actions.token
    .transferSync(client, {
      account: accessKey,
      amount: 10_000_000n,
      to,
      token: tempo.pathUsd,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(
    Actions.accessKey.AccessKeySpendingLimitExceededError,
  )
  expect(error.accessKey).toBe(accessKey.accessKeyAddress)
  const { amount, decimals, errorName, fee, hints, remaining, token } = error
  expect({
    amount,
    decimals,
    errorName,
    fee,
    hints,
    remaining,
    token,
  }).toMatchInlineSnapshot(`
    {
      "amount": 10000000n,
      "decimals": 6,
      "errorName": "SpendingLimitExceeded",
      "fee": false,
      "hints": [
        "Raise the spending limit, or wait for a periodic limit to reset.",
      ],
      "remaining": 5000000n,
      "token": "0x20c0000000000000000000000000000000000000",
    }
  `)
})

test('behavior: key not authorized', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const error = await Actions.token
    .transfer(client, {
      account: accessKey,
      amount: 1n,
      to,
      token: tempo.pathUsd,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.accessKey.AccessKeyError)
  expect(error.accessKey).toBe(accessKey.accessKeyAddress)
  const { errorName, name } = error
  expect({ errorName, name }).toMatchInlineSnapshot(`
    {
      "errorName": "KeyNotFound",
      "name": "AccessKeyError",
    }
  `)
})

test('behavior: key revoked', async () => {
  const accessKey = await setupAccessKey()
  await Actions.accessKey.revokeSync(client, { accessKey })

  const error = await Actions.token
    .transfer(client, {
      account: accessKey,
      amount: 1n,
      to,
      token: tempo.pathUsd,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.accessKey.AccessKeyError)
  expect(error.accessKey).toBe(accessKey.accessKeyAddress)
  const { errorName, name } = error
  expect({ errorName, name }).toMatchInlineSnapshot(`
    {
      "errorName": "KeyAlreadyRevoked",
      "name": "AccessKeyError",
    }
  `)
})

test('behavior: key expired', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  const expiry = Math.floor(Date.now() / 1000) + 8
  await Actions.accessKey.authorizeSync(client, { accessKey, expiry })
  await wait(10_000)

  const error = await Actions.token
    .transfer(client, {
      account: accessKey,
      amount: 1n,
      to,
      token: tempo.pathUsd,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.accessKey.AccessKeyExpiredError)
  expect(error.accessKey).toBe(accessKey.accessKeyAddress)
  expect(error.expiry).toBe(BigInt(expiry))
  const { errorName, name } = error
  expect({ errorName, name }).toMatchInlineSnapshot(`
    {
      "errorName": "KeyExpired",
      "name": "AccessKeyExpiredError",
    }
  `)
}, 30_000)

test('behavior: call not allowed by scopes', async () => {
  const accessKey = await setupAccessKey({
    scopes: [
      {
        address: tempo.pathUsd,
        recipients: ['0x0000000000000000000000000000000000000001'],
        selector: '0xa9059cbb',
      },
    ],
  })

  const error = await Actions.token
    .transfer(client, {
      account: accessKey,
      amount: 1n,
      to,
      token: tempo.pathUsd,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.accessKey.AccessKeyCallNotAllowedError)
  expect(error.accessKey).toBe(accessKey.accessKeyAddress)
  const { errorName, name, selector, target } = error
  expect({ errorName, name, selector, target }).toMatchInlineSnapshot(`
    {
      "errorName": "CallNotAllowed",
      "name": "AccessKeyCallNotAllowedError",
      "selector": "0xa9059cbb",
      "target": "0x20c0000000000000000000000000000000000000",
    }
  `)
})

test('behavior: expiry in the past', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  const expiry = Math.floor(Date.now() / 1000)

  const error = await Actions.accessKey
    .authorize(client, { accessKey, expiry })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.accessKey.AccessKeyExpiryInPastError)
  expect(error.accessKey).toBe(accessKey.accessKeyAddress)
  expect(error.expiry).toBe(BigInt(expiry))
})

test('behavior: expiry too soon', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })

  const error = await Actions.accessKey
    .authorize(client, {
      accessKey,
      expiry: Math.floor(Date.now() / 1000) + 2,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.accessKey.AccessKeyExpiryInPastError)
})

test('behavior: action hints come first', async () => {
  const accessKey = await setupAccessKey()

  const error = await Actions.accessKey
    .authorize(client, {
      accessKey,
      expiry: Math.floor(Date.now() / 1000) + 30,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.accessKey.AccessKeyAlreadyExistsError)
  expect(error.accessKey).toBe(accessKey.accessKeyAddress)
  expect(error.expiry).toBeGreaterThan(0n)
  const { account: errorAccount, errorName, hints, limited } = error
  expect({
    account: errorAccount,
    errorName,
    hints,
    limited,
  }).toMatchInlineSnapshot(`
    {
      "account": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "errorName": "KeyAlreadyExists",
      "hints": [
        "This access key is already authorized. Update its spending limits instead.",
        "Use a new access key, or revoke the existing one.",
      ],
      "limited": false,
    }
  `)
})
