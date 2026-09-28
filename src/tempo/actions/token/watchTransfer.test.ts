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

describe('watchTransfer', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Transfer Watch Token',
      symbol: 'XFER',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('500', 6),
      to: client.account!.address,
      token,
    })
    const watcher = Actions.token.watchTransfer(client, { token })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.transferSync(client, {
        amount: Value.from('100', 6),
        to: account2.address,
        token,
      })
      await Actions.token.transferSync(client, {
        amount: Value.from('50', 6),
        to: account3.address,
        token,
      })
      await waitForLogs(logs, 2)
      expect(logs.length).toBeGreaterThanOrEqual(2)
    } finally {
      watcher.off()
    }
  })
  test('behavior: filter by to address', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Transfer Token',
      symbol: 'FXFER',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('500', 6),
      to: client.account!.address,
      token,
    })
    const watcher = Actions.token.watchTransfer(client, {
      args: { to: account2.address },
      token,
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.transferSync(client, {
        amount: Value.from('100', 6),
        to: account2.address,
        token,
      })
      await Actions.token.transferSync(client, {
        amount: Value.from('50', 6),
        to: account3.address,
        token,
      })
      await Actions.token.transferSync(client, {
        amount: Value.from('75', 6),
        to: account2.address,
        token,
      })
      await waitForLogs(logs, 2)
      expect(logs).toHaveLength(2)
      expect(logs.map((log) => log.args.to)).toEqual([
        account2.address,
        account2.address,
      ])
    } finally {
      watcher.off()
    }
  })
})
