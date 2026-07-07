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

describe('watchOrderPlaced', () => {
  test('default', async () => {
    const { base } = await setupTokenPair('Watch Place')
    const watcher = Actions.dex.watchOrderPlaced(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.dex.placeSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'buy',
        tick: 100,
      })
      await Actions.dex.placeSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'sell',
        tick: -100,
      })
      await waitForLogs(logs, 2)
      expect(logs).toHaveLength(2)
      expect(logs[0]!.args.isBid).toBe(true)
      expect(logs[0]!.args.amount).toBe(Value.from('100', 6))
      expect(logs[1]!.args.isBid).toBe(false)
      expect(logs[1]!.args.amount).toBe(Value.from('100', 6))
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by token', async () => {
    const { base } = await setupTokenPair('Watch Token One')
    const { base: base2 } = await setupTokenPair('Watch Token Two')
    const watcher = Actions.dex.watchOrderPlaced(client, {
      args: { token: base },
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.dex.placeSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'buy',
        tick: 100,
      })
      await Actions.dex.placeSync(client, {
        token: base2,
        amount: Value.from('100', 6),
        type: 'buy',
        tick: 100,
      })
      await waitForLogs(logs)
      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.token).toBe(base)
    } finally {
      watcher.off()
    }
  })
})
