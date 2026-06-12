import { setTimeout } from 'node:timers/promises'
import * as P256 from 'ox/P256'
import * as PublicKey from 'ox/PublicKey'
import { Period } from 'ox/tempo'
import { generatePrivateKey } from 'viem/accounts'
import { Account, Scopes } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import * as actions from './index.js'

const account = accounts[0]
const account2 = accounts[1]

const client = getClient({
  account,
})

/** Authorizes an access key and returns it. */
async function setupAccessKey(
  parameters: {
    limits?: { token: `0x${string}`; limit: bigint; period?: number }[]
    scopes?: {
      address: `0x${string}`
      selector?: `0x${string}`
      recipients?: `0x${string}`[]
    }[]
  } = {},
) {
  const { limits, scopes } = parameters
  const accessKey = Account.fromP256(generatePrivateKey(), {
    access: account,
  })

  await actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Math.floor((Date.now() + 30 * 1000) / 1000), // 30 seconds from now
    limits,
    scopes,
  })

  return accessKey
}

describe('authorize', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const { receipt, ...result } = await actions.accessKey.authorizeSync(
      client,
      {
        accessKey,
        expiry: Math.floor((Date.now() + 30_000) / 1000),
      },
    )

    expect(receipt.status).toBe('success')
    expect(result.publicKey.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )

    // Verify key exists
    const key = await actions.accessKey.getMetadata(client, {
      account: account.address,
      accessKey,
    })
    expect(key.keyType).toBe('p256')
    expect(key.isRevoked).toBe(false)
  })

  test('behavior: format: { address, type }', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const { receipt } = await actions.accessKey.authorizeSync(client, {
      accessKey: {
        address: accessKey.accessKeyAddress,
        type: 'p256',
      },
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    expect(receipt.status).toBe('success')
  })

  test('behavior: format: { publicKey, type }', async () => {
    const privateKey = generatePrivateKey()
    const publicKey = P256.getPublicKey({ privateKey })
    const accessKeyAccount = Account.fromP256(privateKey, {
      access: account,
    })

    const { receipt } = await actions.accessKey.authorizeSync(client, {
      accessKey: {
        publicKey: PublicKey.toHex(publicKey, { includePrefix: false }),
        type: 'p256',
      },
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    expect(receipt.status).toBe('success')

    const key = await actions.accessKey.getMetadata(client, {
      account: account.address,
      accessKey: accessKeyAccount.accessKeyAddress,
    })
    expect(key.keyType).toBe('p256')
    expect(key.isRevoked).toBe(false)
  })

  test('behavior: with limits', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const { receipt, ...result } = await actions.accessKey.authorizeSync(
      client,
      {
        accessKey,
        expiry: Math.floor((Date.now() + 30_000) / 1000),
        limits: [{ token: feeToken, limit: 1000000n }],
      },
    )

    expect(receipt.status).toBe('success')
    expect(result.publicKey.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )

    // Verify limit was set
    const { remaining } = await actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token: feeToken,
    })
    expect(remaining).toBe(1000000n)
  })
})

describe('signAuthorization', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    expect(keyAuthorization).toBeDefined()
    expect(keyAuthorization.address.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )
  })

  test('behavior: format: { address, type }', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
      account,
      accessKey: {
        address: accessKey.accessKeyAddress,
        type: 'p256',
      },
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    expect(keyAuthorization).toBeDefined()
    expect(keyAuthorization.address.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )
    expect(keyAuthorization.type).toBe('p256')
  })

  test('behavior: format: { publicKey, type }', async () => {
    const privateKey = generatePrivateKey()
    const publicKey = P256.getPublicKey({ privateKey })
    const accessKey = Account.fromP256(privateKey, { access: account })

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
      account,
      accessKey: {
        publicKey: PublicKey.toHex(publicKey, { includePrefix: false }),
        type: 'p256',
      },
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    expect(keyAuthorization).toBeDefined()
    expect(keyAuthorization.address.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )
    expect(keyAuthorization.type).toBe('p256')
  })

  test('behavior: with limits', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
      limits: [{ token: feeToken, limit: 1000000n }],
    })

    expect(keyAuthorization).toBeDefined()
    expect(keyAuthorization.limits).toHaveLength(1)
  })

  test('behavior: with periodic limits', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
      limits: [{ token: feeToken, limit: 1000000n, period: Period.days(1) }],
    })

    expect(keyAuthorization).toBeDefined()
    expect(keyAuthorization.limits).toMatchObject([
      { token: feeToken, limit: 1000000n, period: 86400 },
    ])
  })

  test('behavior: with scopes', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
      scopes: [Scopes.tip20(feeToken).transfer()],
    })

    expect(keyAuthorization).toBeDefined()
    expect(keyAuthorization.scopes).toMatchObject([
      { address: feeToken, selector: '0xa9059cbb' },
    ])
  })

  test('behavior: with periodic limits + scopes', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
      limits: [{ token: feeToken, limit: 500000n, period: Period.hours(1) }],
      scopes: [{ address: feeToken }],
    })

    expect(keyAuthorization).toBeDefined()
    expect(keyAuthorization.limits).toMatchObject([
      { token: feeToken, limit: 500000n, period: 3600 },
    ])
    expect(keyAuthorization.scopes).toMatchObject([{ address: feeToken }])
  })
})

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
    const { remaining: initialLimit } =
      await actions.accessKey.getRemainingLimit(client, {
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
    const { remaining: updatedLimit } =
      await actions.accessKey.getRemainingLimit(client, {
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

    const { remaining } = await actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token,
    })

    expect(remaining).toBe(5000000n)
  })

  test('behavior: no limit set for token', async () => {
    const accessKey = await setupAccessKey()

    const { remaining } = await actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token: '0x0000000000000000000000000000000000000001',
    })

    expect(remaining).toBe(0n)
  })
})

/** Returns a random 32-byte witness. */
function randomWitness(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

describe('authorize (witness)', () => {
  test('behavior: with witness', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    const witness = randomWitness()

    const { receipt } = await actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
      witness,
    })

    expect(receipt.status).toBe('success')

    // Witness should not be burned after a successful authorization.
    const isBurned = await actions.accessKey.isWitnessBurned(client, {
      account: account.address,
      witness,
    })
    expect(isBurned).toBe(false)
  })

  test('behavior: reverts when witness already burned', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    const witness = randomWitness()

    await actions.accessKey.burnWitnessSync(client, { witness })

    await expect(
      actions.accessKey.authorizeSync(client, {
        accessKey,
        expiry: Math.floor((Date.now() + 30_000) / 1000),
        witness,
      }),
    ).rejects.toThrow()
  })
})

describe('signAuthorization (witness)', () => {
  test('behavior: with witness', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    const witness = randomWitness()

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
      witness,
    })

    expect(keyAuthorization.witness).toBe(witness)
  })
})

describe('burnWitness', () => {
  test('default', async () => {
    const witness = randomWitness()

    const isBurnedBefore = await actions.accessKey.isWitnessBurned(client, {
      account: account.address,
      witness,
    })
    expect(isBurnedBefore).toBe(false)

    const { receipt, ...result } = await actions.accessKey.burnWitnessSync(
      client,
      { witness },
    )

    expect(receipt.status).toBe('success')
    expect(result.witness).toBe(witness)
    expect(result.account.toLowerCase()).toBe(account.address.toLowerCase())

    const isBurnedAfter = await actions.accessKey.isWitnessBurned(client, {
      account: account.address,
      witness,
    })
    expect(isBurnedAfter).toBe(true)
  })

  test('behavior: reverts when already burned', async () => {
    const witness = randomWitness()

    await actions.accessKey.burnWitnessSync(client, { witness })

    await expect(
      actions.accessKey.burnWitnessSync(client, { witness }),
    ).rejects.toThrow()
  })
})

describe('isWitnessBurned', () => {
  test('default', async () => {
    const witness = randomWitness()

    expect(
      await actions.accessKey.isWitnessBurned(client, {
        account: account.address,
        witness,
      }),
    ).toBe(false)
  })
})

describe('watchWitness', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    const witness = randomWitness()

    const logs: any[] = []
    const unwatch = actions.accessKey.watchWitness(client, {
      onWitness: (args, log) => {
        logs.push({ args, log })
      },
    })

    await actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
      witness,
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(
      logs.some((l) => l.args.witness.toLowerCase() === witness.toLowerCase()),
    ).toBe(true)
  })
})

describe('watchWitnessBurned', () => {
  test('default', async () => {
    const witness = randomWitness()

    const logs: any[] = []
    const unwatch = actions.accessKey.watchWitnessBurned(client, {
      onBurned: (args, log) => {
        logs.push({ args, log })
      },
    })

    await actions.accessKey.burnWitnessSync(client, { witness })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(
      logs.some((l) => l.args.witness.toLowerCase() === witness.toLowerCase()),
    ).toBe(true)
  })
})

describe('authorize (admin)', () => {
  test('behavior: admin', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const { receipt } = await actions.accessKey.authorizeSync(client, {
      accessKey,
      admin: true,
    })

    expect(receipt.status).toBe('success')

    const isAdmin = await actions.accessKey.isAdmin(client, {
      account: account.address,
      accessKey,
    })
    expect(isAdmin).toBe(true)
  })
})

describe('authorize (admin manages keys)', () => {
  test('behavior: admin key authorizes another key', async () => {
    // 1. Root authorizes an admin key.
    const adminKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey: adminKey,
      admin: true,
    })

    // 2. The admin key authorizes a new (regular) key on behalf of the account.
    const childKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    const { receipt } = await actions.accessKey.authorizeSync(client, {
      account: adminKey,
      accessKey: childKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    expect(receipt.status).toBe('success')

    // 3. Verify the child key is registered on the account.
    const key = await actions.accessKey.getMetadata(client, {
      account: account.address,
      accessKey: childKey,
    })
    expect(key.isRevoked).toBe(false)
    expect(key.address.toLowerCase()).toBe(
      childKey.accessKeyAddress.toLowerCase(),
    )
  })
})

describe('signAuthorization (admin)', () => {
  test('behavior: admin', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await actions.accessKey.signAuthorization(client, {
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
})

describe('isAdmin', () => {
  test('default', async () => {
    const accessKey = await setupAccessKey()

    expect(
      await actions.accessKey.isAdmin(client, {
        account: account.address,
        accessKey,
      }),
    ).toBe(false)
  })

  test('behavior: non-existent key', async () => {
    expect(
      await actions.accessKey.isAdmin(client, {
        account: account.address,
        accessKey: '0x0000000000000000000000000000000000000001',
      }),
    ).toBe(false)
  })
})

describe('watchAdminAuthorized', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const logs: any[] = []
    const unwatch = actions.accessKey.watchAdminAuthorized(client, {
      onAuthorized: (args, log) => {
        logs.push({ args, log })
      },
    })

    await actions.accessKey.authorizeSync(client, {
      accessKey,
      admin: true,
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(
      logs.some(
        (l) =>
          l.args.publicKey.toLowerCase() ===
          accessKey.accessKeyAddress.toLowerCase(),
      ),
    ).toBe(true)
  })
})

describe('verifyHash', () => {
  const hash =
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const

  test('default', async () => {
    const adminKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey: adminKey,
      admin: true,
    })

    const signature = await adminKey.sign({ hash })

    const valid = await actions.accessKey.verifyHash(client, {
      account: account.address,
      hash,
      signature,
    })
    expect(valid).toBe(true)
  })

  test('behavior: non-admin key returns false by default', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const signature = await accessKey.sign({ hash })

    const valid = await actions.accessKey.verifyHash(client, {
      account: account.address,
      hash,
      signature,
    })
    expect(valid).toBe(false)
  })

  test('behavior: admin: false accepts any active access key', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const signature = await accessKey.sign({ hash })

    const valid = await actions.accessKey.verifyHash(client, {
      account: account.address,
      admin: false,
      hash,
      signature,
    })
    expect(valid).toBe(true)
  })

  test('behavior: account mismatch', async () => {
    const adminKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      accessKey: adminKey,
      admin: true,
    })

    const signature = await adminKey.sign({ hash })

    const valid = await actions.accessKey.verifyHash(client, {
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

    const signature = await accessKey.sign({ hash })

    const valid = await actions.accessKey.verifyHash(client, {
      account: account.address,
      admin: false,
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

    const signature = await accessKey.sign({ hash })

    const valid = await actions.accessKey.verifyHash(client, {
      account: account.address,
      admin: false,
      hash,
      signature,
    })
    expect(valid).toBe(false)
  })
})
