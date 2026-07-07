import * as Value from 'ox/Value'
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

describe('place', () => {
  test('default', async () => {
    const { base } = await setupTokenPair('Place Default')
    const { receipt, orderId, token, ...result } = await Actions.dex.placeSync(
      client,
      { token: base, amount: Value.from('100', 6), type: 'sell', tick: 100 },
    )
    expect(receipt.status).toBe('success')
    expect(orderId).toBeGreaterThan(0n)
    expect(token).toBe(base)
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "flipTick": 0,
        "isBid": false,
        "isFlipOrder": false,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "tick": 100,
      }
    `)
    const {
      receipt: receipt2,
      orderId: orderId2,
      token: token2,
      ...result2
    } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    expect(receipt2.status).toBe('success')
    expect(orderId2).toBeGreaterThan(0n)
    expect(token2).toBe(base)
    expect(result2).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "flipTick": 0,
        "isBid": true,
        "isFlipOrder": false,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "tick": 100,
      }
    `)
  })

  test('behavior: tick at boundaries', async () => {
    const { base } = await setupTokenPair('Place Bounds')
    const { receipt: receipt1, ...result1 } = await Actions.dex.placeSync(
      client,
      {
        token: base,
        amount: Value.from('100', 6),
        type: 'sell',
        tick: minTick,
      },
    )
    expect(receipt1.status).toBe('success')
    expect(result1.tick).toBe(minTick)
    const { receipt: receipt2, ...result2 } = await Actions.dex.placeSync(
      client,
      { token: base, amount: Value.from('100', 6), type: 'buy', tick: maxTick },
    )
    expect(receipt2.status).toBe('success')
    expect(result2.tick).toBe(maxTick)
  })

  test('behavior: tick validation fails outside bounds', async () => {
    const { base } = await setupTokenPair('Place Bounds')

    // Above max tick
    await expect(
      Actions.dex.placeSync(client, {
        amount: Value.from('100', 6),
        tick: 2001,
        token: base,
        type: 'buy',
      }),
    ).rejects.toThrow('The contract function "place" reverted')

    // Below min tick
    await expect(
      Actions.dex.placeSync(client, {
        amount: Value.from('100', 6),
        tick: -2001,
        token: base,
        type: 'sell',
      }),
    ).rejects.toThrow('The contract function "place" reverted')
  })

  test('behavior: transfers from wallet', async () => {
    const { base, quote } = await setupTokenPair('Place Transfer')
    const baseBefore = await Actions.token.getBalance(client, { token: base })
    const quoteBefore = await Actions.token.getBalance(client, { token: quote })
    const amount = Value.from('100', 6)
    const tick = 100
    await Actions.dex.placeSync(client, {
      token: base,
      amount,
      type: 'buy',
      tick,
    })
    const baseAfter = await Actions.token.getBalance(client, { token: base })
    const quoteAfter = await Actions.token.getBalance(client, { token: quote })
    expect(baseAfter.amount).toBe(baseBefore.amount)
    expect(quoteBefore.amount - quoteAfter.amount).toBeGreaterThanOrEqual(
      (amount * BigInt(100000 + tick)) / 100000n,
    )
  })

  test('behavior: multiple orders at same tick', async () => {
    const { base } = await setupTokenPair('Place Multi')
    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 50,
    })
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 50,
    })
    expect(orderId2).toBeGreaterThan(orderId1)
  })
})
