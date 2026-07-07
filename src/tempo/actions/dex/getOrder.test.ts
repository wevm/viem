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

describe('getOrder', () => {
  test('default', async () => {
    const { base } = await setupTokenPair('Order Default')
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    const { bookKey, ...order } = await Actions.dex.getOrder(client, {
      orderId,
    })
    expect(bookKey).toBeDefined()
    expect(order).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "flipTick": 0,
        "isBid": true,
        "isFlip": false,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "next": 0n,
        "orderId": 1n,
        "prev": 0n,
        "remaining": 100000000n,
        "tick": 100,
      }
    `)
  })

  test('behavior: returns flip order details', async () => {
    const { base } = await setupTokenPair('Order Flip')
    const { orderId } = await Actions.dex.placeFlipSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
      flipTick: 200,
    })
    const order = await Actions.dex.getOrder(client, { orderId })
    expect(order.maker).toBe(account.address)
    expect(order.isBid).toBe(true)
    expect(order.tick).toBe(100)
    expect(order.amount).toBe(Value.from('100', 6))
    expect(order.isFlip).toBe(true)
    expect(order.flipTick).toBe(200)
  })

  test('behavior: fails for non-existent order', async () => {
    await expect(
      Actions.dex.getOrder(client, { orderId: 999999999n }),
    ).rejects.toThrow('The contract function "getOrder" reverted')
  })

  test('behavior: reflects order state after partial fill', async () => {
    const { base, quote } = await setupTokenPair('Order Fill')
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('500', 6),
      type: 'sell',
      tick: 100,
    })
    const before = await Actions.dex.getOrder(client, { orderId })
    expect(before.amount).toBe(Value.from('500', 6))
    expect(before.remaining).toBe(Value.from('500', 6))
    await Actions.dex.buySync(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: Value.from('100', 6),
      maxAmountIn: Value.from('150', 6),
    })
    const after = await Actions.dex.getOrder(client, { orderId })
    expect(after.amount).toBe(Value.from('500', 6))
    expect(after.remaining).toBeLessThan(Value.from('500', 6))
  })

  test('behavior: linked list pointers for multiple orders at same tick', async () => {
    const { base } = await setupTokenPair('Order Links')
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
    const order1 = await Actions.dex.getOrder(client, { orderId: orderId1 })
    expect(order1.prev).toBe(0n)
    expect(order1.next).toBe(orderId2)
    const order2 = await Actions.dex.getOrder(client, { orderId: orderId2 })
    expect(order2.prev).toBe(orderId1)
    expect(order2.next).toBe(0n)
  })
})
