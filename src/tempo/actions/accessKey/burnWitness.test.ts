import { Hex, P256 } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('burnWitnessSync', () => {
  test('default', async () => {
    const witness = Hex.random(32)

    const isBurnedBefore = await Actions.accessKey.isWitnessBurned(client, {
      account: account.address,
      witness,
    })
    expect(isBurnedBefore).toBe(false)

    const { receipt, ...result } = await Actions.accessKey.burnWitnessSync(
      client,
      { witness },
    )

    expect(receipt.status).toBe('success')
    expect(result.witness).toBe(witness)
    expect(result.account.toLowerCase()).toBe(account.address.toLowerCase())

    const isBurnedAfter = await Actions.accessKey.isWitnessBurned(client, {
      account: account.address,
      witness,
    })
    expect(isBurnedAfter).toBe(true)
  })

  test('behavior: reverts when already burned', async () => {
    const witness = Hex.random(32)

    await Actions.accessKey.burnWitnessSync(client, { witness })

    await expect(
      Actions.accessKey.burnWitnessSync(client, { witness }),
    ).rejects.toThrow()
  })
})

describe('isWitnessBurned', () => {
  test('default', async () => {
    const witness = Hex.random(32)

    expect(
      await Actions.accessKey.isWitnessBurned(client, {
        account: account.address,
        witness,
      }),
    ).toBe(false)
  })
})

describe('watchWitness', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    const witness = Hex.random(32)

    const watcher = Actions.accessKey.watchWitness(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.accessKey.authorizeSync(client, {
        accessKey,
        expiry: Math.floor((Date.now() + 30_000) / 1000),
        witness,
      })

      await waitForLogs(logs)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      expect(
        logs.some(
          (log) => log.args.witness.toLowerCase() === witness.toLowerCase(),
        ),
      ).toBe(true)
    } finally {
      watcher.off()
    }
  })
})

describe('watchWitnessBurned', () => {
  test('default', async () => {
    const witness = Hex.random(32)

    const watcher = Actions.accessKey.watchWitnessBurned(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.accessKey.burnWitnessSync(client, { witness })

      await waitForLogs(logs)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      expect(
        logs.some(
          (log) => log.args.witness.toLowerCase() === witness.toLowerCase(),
        ),
      ).toBe(true)
    } finally {
      watcher.off()
    }
  })
})
