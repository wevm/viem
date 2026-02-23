import { generatePrivateKey } from 'viem/accounts'
import { sendTransactionSync } from 'viem/actions'
import { Account } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import * as actions from './index.js'

const account = accounts[0]

const client = getClient({
  account,
})

/** Authorizes an access key and returns it. */
async function setupAccessKey(
  parameters: { limits?: { token: `0x${string}`; limit: bigint }[] } = {},
) {
  const { limits } = parameters
  const accessKey = Account.fromP256(generatePrivateKey(), {
    access: account,
  })

  const keyAuthorization = await account.signKeyAuthorization(accessKey, {
    expiry: Math.floor((Date.now() + 30 * 1000) / 1000), // 30 seconds from now
    limits,
  })

  await sendTransactionSync(client, {
    account,
    keyAuthorization,
  })

  return accessKey
}

describe('getMetadata', () => {
  test('default', async () => {
    const accessKey = await setupAccessKey()

    const key = await actions.accessKey.getMetadata(client, {
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
    const key = await actions.accessKey.getMetadata(client, {
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
})

describe('revoke', () => {
  test('default', async () => {
    const accessKey = await setupAccessKey()

    const { receipt, ...result } = await actions.accessKey.revokeSync(client, {
      accessKey,
    })

    expect(receipt.status).toBe('success')
    expect(result.publicKey.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )

    // Verify key is revoked
    const keyAfter = await actions.accessKey.getMetadata(client, {
      account: account.address,
      accessKey,
    })
    expect(keyAfter.isRevoked).toBe(true)
  })
})

describe('updateLimit', () => {
  test('default', async () => {
    const token = feeToken
    const accessKey = await setupAccessKey({
      limits: [{ token, limit: 1000000n }],
    })

    // Check initial limit
    const initialLimit = await actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token,
    })
    expect(initialLimit).toBe(1000000n)

    // Update the limit
    const { receipt, ...result } = await actions.accessKey.updateLimitSync(
      client,
      {
        accessKey,
        token,
        limit: 2000000n,
      },
    )

    expect(receipt.status).toBe('success')
    expect(result.limit).toBe(2000000n)

    // Verify updated limit
    const updatedLimit = await actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token,
    })
    expect(updatedLimit).toBe(2000000n)
  })
})

describe('getRemainingLimit', () => {
  test('default', async () => {
    const token = feeToken
    const accessKey = await setupAccessKey({
      limits: [{ token, limit: 5000000n }],
    })

    const remaining = await actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token,
    })

    expect(remaining).toBe(5000000n)
  })

  test('behavior: no limit set for token', async () => {
    const accessKey = await setupAccessKey()

    const remaining = await actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token: '0x0000000000000000000000000000000000000001',
    })

    expect(remaining).toBe(0n)
  })
})
