import { P256 } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

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

describe('updateLimitSync', () => {
  test('default', async () => {
    const token = tempo.pathUsd
    const accessKey = await setupAccessKey([{ token, limit: 1000000n }])

    const { remaining: initialLimit } =
      await Actions.accessKey.getRemainingLimit(client, {
        account: account.address,
        accessKey,
        token,
      })
    expect(initialLimit).toBe(1000000n)

    const { receipt, ...result } = await Actions.accessKey.updateLimitSync(
      client,
      {
        accessKey,
        token,
        limit: 2000000n,
      },
    )

    expect(receipt.status).toBe('success')
    expect(result.limit).toBe(2000000n)

    const { remaining: updatedLimit } =
      await Actions.accessKey.getRemainingLimit(client, {
        account: account.address,
        accessKey,
        token,
      })
    expect(updatedLimit).toBe(2000000n)
  })
})

describe('getRemainingLimit', () => {
  test('default', async () => {
    const token = tempo.pathUsd
    const accessKey = await setupAccessKey([{ token, limit: 5000000n }])

    const { remaining } = await Actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token,
    })

    expect(remaining).toBe(5000000n)
  })

  test('behavior: no limit set for token', async () => {
    const accessKey = await setupAccessKey()

    const { remaining } = await Actions.accessKey.getRemainingLimit(client, {
      account: account.address,
      accessKey,
      token: '0x0000000000000000000000000000000000000001',
    })

    expect(remaining).toBe(0n)
  })
})
