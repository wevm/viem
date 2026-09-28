import { Hex, P256, PublicKey } from 'ox'
import * as tempo from '~test/tempo.js'
import { Actions as CoreActions } from 'viem'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

const expiry = () => Math.floor((Date.now() + 30_000) / 1000)

describe('authorizeSync', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })

    const { receipt, ...result } = await Actions.accessKey.authorizeSync(
      client,
      {
        accessKey,
        expiry: expiry(),
      },
    )

    expect(receipt.status).toBe('success')
    expect(result.publicKey.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )

    const key = await Actions.accessKey.getMetadata(client, {
      account: account.address,
      accessKey,
    })
    expect(key.keyType).toBe('p256')
    expect(key.isRevoked).toBe(false)
  })

  test('behavior: format: { address, type }', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })

    const { receipt } = await Actions.accessKey.authorizeSync(client, {
      accessKey: {
        address: accessKey.accessKeyAddress,
        type: 'p256',
      },
      expiry: expiry(),
    })

    expect(receipt.status).toBe('success')
  })

  test('behavior: format: { publicKey, type }', async () => {
    const privateKey = P256.randomPrivateKey()
    const publicKey = P256.getPublicKey({ privateKey })
    const accessKey = Account.fromP256(privateKey, { access: account })

    const { receipt } = await Actions.accessKey.authorizeSync(client, {
      accessKey: {
        publicKey: PublicKey.toHex(publicKey, { includePrefix: false }),
        type: 'p256',
      },
      expiry: expiry(),
    })

    expect(receipt.status).toBe('success')

    const key = await Actions.accessKey.getMetadata(client, {
      account: account.address,
      accessKey: accessKey.accessKeyAddress,
    })
    expect(key.keyType).toBe('p256')
    expect(key.isRevoked).toBe(false)
  })

  test('behavior: with limits', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })

    const { receipt, ...result } = await Actions.accessKey.authorizeSync(
      client,
      {
        accessKey,
        expiry: expiry(),
        limits: [{ token: tempo.pathUsd, limit: 1000000n }],
      },
    )

    expect(receipt.status).toBe('success')
    expect(result.publicKey.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )

    const { remaining } = await Actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token: tempo.pathUsd,
    })
    expect(remaining).toBe(1000000n)
  })

  test('behavior: with witness', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    const witness = Hex.random(32)

    const { receipt } = await Actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: expiry(),
      witness,
    })

    expect(receipt.status).toBe('success')

    // Witness should not be burned after a successful authorization.
    const isBurned = await Actions.accessKey.isWitnessBurned(client, {
      account: account.address,
      witness,
    })
    expect(isBurned).toBe(false)
  })

  test('behavior: reverts when witness already burned', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    const witness = Hex.random(32)

    await Actions.accessKey.burnWitnessSync(client, { witness })

    await expect(
      Actions.accessKey.authorizeSync(client, {
        accessKey,
        expiry: expiry(),
        witness,
      }),
    ).rejects.toThrow()
  })

  test('behavior: admin', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })

    const { receipt } = await Actions.accessKey.authorizeSync(client, {
      accessKey,
      admin: true,
    })

    expect(receipt.status).toBe('success')

    const isAdmin = await Actions.accessKey.isAdmin(client, {
      account: account.address,
      accessKey,
    })
    expect(isAdmin).toBe(true)
  })

  test('behavior: admin key authorizes another key', async () => {
    // 1. Root authorizes an admin key.
    const adminKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    await Actions.accessKey.authorizeSync(client, {
      accessKey: adminKey,
      admin: true,
    })

    // 2. The admin key authorizes a new (regular) key on behalf of the account.
    const childKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    const { receipt } = await Actions.accessKey.authorizeSync(client, {
      account: adminKey,
      accessKey: childKey,
      expiry: expiry(),
    })

    expect(receipt.status).toBe('success')

    // 3. Verify the child key is registered on the account.
    const key = await Actions.accessKey.getMetadata(client, {
      account: account.address,
      accessKey: childKey,
    })
    expect(key.isRevoked).toBe(false)
    expect(key.address.toLowerCase()).toBe(
      childKey.accessKeyAddress.toLowerCase(),
    )
  })
})

describe('authorize', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })

    const hash = await Actions.accessKey.authorize(client, {
      accessKey,
      expiry: expiry(),
    })
    const receipt = await CoreActions.transaction.waitForReceipt(client, {
      hash,
    }).receipt
    expect(receipt.status).toBe('success')

    const { args } = Actions.accessKey.authorize.extractEvent(receipt.logs)
    expect(args.publicKey.toLowerCase()).toBe(
      accessKey.accessKeyAddress.toLowerCase(),
    )
  })
})
