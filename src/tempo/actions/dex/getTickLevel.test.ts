import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

const minTick = -2000
const maxTick = 2000

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

describe('getTickLevel', () => {
  test('default', async () => {
    const { base } = await setupTokenPair('Level Default')
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    expect(
      await Actions.dex.getTickLevel(client, { base, tick: 100, isBid: true }),
    ).toMatchObject({ head: orderId, tail: orderId })
  })

  test('behavior: empty price level', async () => {
    const { base } = await setupTokenPair('Level Empty')
    expect(
      await Actions.dex.getTickLevel(client, { base, tick: 100, isBid: true }),
    ).toMatchInlineSnapshot(`
      {
        "head": 0n,
        "tail": 0n,
        "totalLiquidity": 0n,
      }
    `)
  })

  test('behavior: multiple orders at same tick', async () => {
    const { base } = await setupTokenPair('Level Multi')
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
    const level = await Actions.dex.getTickLevel(client, {
      base,
      tick: 100,
      isBid: true,
    })
    expect(level.head).toBe(orderId1)
    expect(level.tail).toBe(orderId2)
    expect(level.totalLiquidity).toBeGreaterThan(Value.from('145', 6))
  })

  test('behavior: bid vs ask sides', async () => {
    const { base } = await setupTokenPair('Level Sides')
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
      tick: 100,
    })
    const bidLevel = await Actions.dex.getTickLevel(client, {
      base,
      tick: 100,
      isBid: true,
    })
    const askLevel = await Actions.dex.getTickLevel(client, {
      base,
      tick: 100,
      isBid: false,
    })
    expect(bidLevel.totalLiquidity).toBeGreaterThan(0n)
    expect(askLevel.totalLiquidity).toBeGreaterThan(0n)
    expect(bidLevel.head).not.toBe(askLevel.head)
  })

  test('behavior: liquidity changes after order cancellation', async () => {
    const { base } = await setupTokenPair('Level Cancel')
    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    const before = await Actions.dex.getTickLevel(client, {
      base,
      tick: 100,
      isBid: true,
    })
    await Actions.dex.cancelSync(client, { orderId: orderId1 })
    const after = await Actions.dex.getTickLevel(client, {
      base,
      tick: 100,
      isBid: true,
    })
    expect(after.totalLiquidity).toBeLessThan(before.totalLiquidity)
  })

  test('behavior: liquidity changes after partial fill', async () => {
    const { base, quote } = await setupTokenPair('Level Fill')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('500', 6),
      type: 'sell',
      tick: 100,
    })
    const before = await Actions.dex.getTickLevel(client, {
      base,
      tick: 100,
      isBid: false,
    })
    await Actions.dex.buySync(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: Value.from('100', 6),
      maxAmountIn: Value.from('150', 6),
    })
    const after = await Actions.dex.getTickLevel(client, {
      base,
      tick: 100,
      isBid: false,
    })
    expect(after.totalLiquidity).toBeLessThan(before.totalLiquidity)
  })

  test('behavior: tick at boundaries', async () => {
    const { base } = await setupTokenPair('Level Bounds')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'sell',
      tick: minTick,
    })
    expect(
      (
        await Actions.dex.getTickLevel(client, {
          base,
          tick: minTick,
          isBid: false,
        })
      ).totalLiquidity,
    ).toBeGreaterThan(0n)
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: maxTick,
    })
    expect(
      (
        await Actions.dex.getTickLevel(client, {
          base,
          tick: maxTick,
          isBid: true,
        })
      ).totalLiquidity,
    ).toBeGreaterThan(0n)
  })
})
