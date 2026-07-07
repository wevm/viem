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

describe('watchFlipOrderPlaced', () => {
  test('default', async () => {
    const { base } = await setupTokenPair('Watch Flip')
    const watcher = Actions.dex.watchFlipOrderPlaced(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.dex.placeSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'buy',
        tick: 100,
      })
      await Actions.dex.placeFlipSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'buy',
        tick: 100,
        flipTick: 200,
      })
      await waitForLogs(logs)
      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.flipTick).toBe(200)
      expect(logs[0]!.args.tick).toBe(100)
      expect(logs[0]!.args.isFlipOrder).toBe(true)
    } finally {
      watcher.off()
    }
  })
})
