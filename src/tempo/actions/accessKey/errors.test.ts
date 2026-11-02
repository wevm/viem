import { P256 } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const to = '0x000000000000000000000000000000000000dEaD'

/** Authorizes an access key with the given limits and returns it. */
async function setupAccessKey(
  limits?: { token: `0x${string}`; limit: bigint }[],
) {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  await Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Math.floor((Date.now() + 30_000) / 1000),
    limits,
  })
  return accessKey
}

test('behavior: spending limit exceeded by the call', async () => {
  const accessKey = await setupAccessKey([
    { token: tempo.pathUsd, limit: 5_000_000n },
  ])

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
