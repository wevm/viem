import { Hex, Value } from 'ox'
import { TokenRole } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })

void Hex
void TokenRole
void account3
void client2
void fund

async function fund(address: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: Value.from('1', 6),
    to: address,
    token: tempo.pathUsd,
  })
}

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchRole', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Role Watch Token',
      symbol: 'ROLE',
    })
    const watcher = Actions.token.watchRole(client, { token })
    const logs: any[] = []
    // The watcher's first poll can pick up the creator's role events from the
    // token-creation block; keep only the accounts this test targets so the
    // log count tracks the grant/revoke transactions below.
    watcher.onLogs((batch) =>
      logs.push(
        ...batch.filter(
          (log) =>
            log.args.account === account2.address ||
            log.args.account === account3.address,
        ),
      ),
    )
    try {
      await Actions.token.grantRolesSync(client, {
        roles: ['issuer'],
        to: account2.address,
        token,
      })
      await Actions.token.grantRolesSync(client, {
        roles: ['pause'],
        to: account3.address,
        token,
      })
      await Actions.token.revokeRolesSync(client, {
        from: account2.address,
        roles: ['issuer'],
        token,
      })
      await waitForLogs(logs, 3)
      const updates = logs.map((log) => ({
        account: log.args.account,
        hasRole: log.args.hasRole,
        role: log.args.role,
      }))
      expect(updates).toMatchInlineSnapshot(`
        [
          {
            "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "hasRole": true,
            "role": "0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122",
          },
          {
            "account": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            "hasRole": true,
            "role": "0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d",
          },
          {
            "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "hasRole": false,
            "role": "0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122",
          },
        ]
      `)
    } finally {
      watcher.off()
    }
  })
  test('behavior: filter by account address', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Role Token',
      symbol: 'FROLE',
    })
    const watcher = Actions.token.watchRole(client, {
      args: { account: account2.address },
      token,
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.grantRolesSync(client, {
        roles: ['issuer'],
        to: account2.address,
        token,
      })
      await Actions.token.grantRolesSync(client, {
        roles: ['pause'],
        to: account3.address,
        token,
      })
      await Actions.token.revokeRolesSync(client, {
        from: account2.address,
        roles: ['issuer'],
        token,
      })
      await waitForLogs(logs, 2)
      expect(logs).toHaveLength(2)
      expect(logs.map((log) => log.args.account)).toEqual([
        account2.address,
        account2.address,
      ])
      expect(logs.map((log) => log.args.hasRole)).toEqual([true, false])
    } finally {
      watcher.off()
    }
  })
})
