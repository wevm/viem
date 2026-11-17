import { Value } from 'ox'
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

describe('watchOrderFilled', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Watch Fill')
    const { orderId } = await Actions.dex.placeSync(client, {
      amount: Value.from('500', 6),
      tick: 100,
      token: base,
      type: 'sell',
    })
    const watcher = Actions.dex.watchOrderFilled(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.dex.buySync(client, {
        amountOut: Value.from('100', 6),
        maxAmountIn: Value.from('150', 6),
        tokenIn: quote,
        tokenOut: base,
      })
      await waitForLogs(logs)
      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.orderId).toBe(orderId)
      expect(logs[0]!.args.maker.toLowerCase()).toBe(
        account.address.toLowerCase(),
      )
      expect(logs[0]!.args.taker.toLowerCase()).toBe(
        account.address.toLowerCase(),
      )
      expect(logs[0]!.args.amountFilled).toBe(Value.from('100', 6))
      expect(logs[0]!.args.partialFill).toBe(true)

      // Filling the rest of the order emits a full fill.
      await Actions.dex.buySync(client, {
        amountOut: Value.from('400', 6),
        maxAmountIn: Value.from('600', 6),
        tokenIn: quote,
        tokenOut: base,
      })
      await waitForLogs(logs, 2)
      expect(logs).toHaveLength(2)
      expect(logs[1]!.args.orderId).toBe(orderId)
      expect(logs[1]!.args.amountFilled).toBe(Value.from('400', 6))
      expect(logs[1]!.args.partialFill).toBe(false)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by orderId', async () => {
    const { base, quote } = await setupTokenPair('Watch Fill Filter')
    const { orderId } = await Actions.dex.placeSync(client, {
      amount: Value.from('100', 6),
      tick: 100,
      token: base,
      type: 'sell',
    })
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      amount: Value.from('100', 6),
      tick: 200,
      token: base,
      type: 'sell',
    })
    const watcher = Actions.dex.watchOrderFilled(client, {
      args: { orderId },
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      // Fills the whole first order and part of the second.
      await Actions.dex.buySync(client, {
        amountOut: Value.from('150', 6),
        maxAmountIn: Value.from('300', 6),
        tokenIn: quote,
        tokenOut: base,
      })
      await waitForLogs(logs)
      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.orderId).toBe(orderId)
      expect(logs[0]!.args.orderId).not.toBe(orderId2)
    } finally {
      watcher.off()
    }
  })
})
