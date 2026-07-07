import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function setupTokenPair(name: string) {
  const { token: base } = await Actions.token.createSync(client, {
    currency: 'USD',
    name,
    symbol: name.slice(0, 8).toUpperCase(),
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: account.address,
    token: base,
  })
  await Actions.token.mintSync(client, {
    amount: Value.from('1000000', 6),
    to: account.address,
    token: base,
  })
  const { quote } = await Actions.dex.createPairSync(client, { base })
  return { base, quote }
}

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchOrderCancelled', () => {
  test('default', async () => {
    const { base } = await setupTokenPair('Watch Cancel')
    const watcher = Actions.dex.watchOrderCancelled(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      const { orderId } = await Actions.dex.placeSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'buy',
        tick: 100,
      })
      await Actions.dex.cancelSync(client, { orderId })
      await waitForLogs(logs)
      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.orderId).toBe(orderId)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by orderId', async () => {
    const { base } = await setupTokenPair('Watch Cancel Filter')
    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    const watcher = Actions.dex.watchOrderCancelled(client, {
      args: { orderId: orderId1 },
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.dex.cancelSync(client, { orderId: orderId1 })
      await Actions.dex.cancelSync(client, { orderId: orderId2 })
      await waitForLogs(logs)
      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.orderId).toBe(orderId1)
    } finally {
      watcher.off()
    }
  })
})
