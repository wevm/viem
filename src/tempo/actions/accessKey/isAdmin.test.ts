import { P256 } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('isAdmin', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    await Actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    expect(
      await Actions.accessKey.isAdmin(client, {
        account: account.address,
        accessKey,
      }),
    ).toBe(false)
  })

  test('behavior: non-existent key', async () => {
    expect(
      await Actions.accessKey.isAdmin(client, {
        account: account.address,
        accessKey: '0x0000000000000000000000000000000000000001',
      }),
    ).toBe(false)
  })
})

describe('watchAdminAuthorized', () => {
  test('default', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })

    const watcher = Actions.accessKey.watchAdminAuthorized(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.accessKey.authorizeSync(client, {
        accessKey,
        admin: true,
      })

      await waitForLogs(logs)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      expect(
        logs.some(
          (log) =>
            log.args.publicKey.toLowerCase() ===
            accessKey.accessKeyAddress.toLowerCase(),
        ),
      ).toBe(true)
    } finally {
      watcher.off()
    }
  })
})
