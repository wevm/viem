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

describe('watchAdminRole', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Admin Role Watch Token',
      symbol: 'ADMIN',
    })
    const watcher = Actions.token.watchAdminRole(client, { token })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.setRoleAdminSync(client, {
        adminRole: 'pause',
        role: 'issuer',
        token,
      })
      await Actions.token.setRoleAdminSync(client, {
        adminRole: 'unpause',
        role: 'pause',
        token,
      })
      await waitForLogs(logs, 2)
      expect(logs).toHaveLength(2)
      expect(logs.map((log) => log.args.sender)).toEqual([
        client.account!.address,
        client.account!.address,
      ])
      expect(logs[0]!.args.newAdminRole).toBe(TokenRole.serialize('pause'))
    } finally {
      watcher.off()
    }
  })
})
