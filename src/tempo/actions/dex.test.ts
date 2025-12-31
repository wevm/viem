import { parseUnits } from 'viem'
import { Actions, Tick } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, getClient, setupTokenPair } from '~test/tempo/config.js'

const client = getClient({
  account: accounts[0],
})

describe('buy', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place ask order to create liquidity
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'sell',
      tick: Tick.fromPrice('1.001'),
    })

    // Get initial balances
    const baseBalanceBefore = await Actions.token.getBalance(client, {
      token: base,
    })

    // Buy base tokens with quote tokens
    const { receipt } = await Actions.dex.buySync(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: parseUnits('100', 6),
      maxAmountIn: parseUnits('150', 6),
    })

    expect(receipt).toBeDefined()
    expect(receipt.status).toBe('success')

    // Verify balances changed
    const baseBalanceAfter = await Actions.token.getBalance(client, {
      token: base,
    })

    // Should have received base tokens
    expect(baseBalanceAfter).toBeGreaterThan(baseBalanceBefore)
  })

  test('behavior: respects maxAmountIn', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place ask order at high price
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'sell',
      tick: Tick.fromPrice('1.01'), // 1% above peg
    })

    // Try to buy with insufficient maxAmountIn - should fail
    await expect(
      Actions.dex.buySync(client, {
        tokenIn: quote,
        tokenOut: base,
        amountOut: parseUnits('100', 6),
        maxAmountIn: parseUnits('100', 6), // Way too low for 1% premium
      }),
    ).rejects.toThrow('The contract function "swapExactAmountOut" reverted')
  })

  test('behavior: fails with insufficient liquidity', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Don't place any orders - no liquidity

    // Try to buy - should fail due to no liquidity
    await expect(
      Actions.dex.buySync(client, {
        tokenIn: quote,
        tokenOut: base,
        amountOut: parseUnits('100', 6),
        maxAmountIn: parseUnits('150', 6),
      }),
    ).rejects.toThrow('The contract function "swapExactAmountOut" reverted')
  })
})

describe('cancel', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place a bid order
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })

    // Check initial DEX balance (should be 0)
    const dexBalanceBefore = await Actions.dex.getBalance(client, {
      account: client.account.address,
      token: quote,
    })
    expect(dexBalanceBefore).toBe(0n)

    // Cancel the order
    const { receipt, orderId: returnedOrderId } = await Actions.dex.cancelSync(
      client,
      {
        orderId,
      },
    )

    expect(receipt).toBeDefined()
    expect(receipt.status).toBe('success')
    expect(returnedOrderId).toBe(orderId)

    // Check DEX balance after cancel - tokens should be refunded to internal balance
    const dexBalanceAfter = await Actions.dex.getBalance(client, {
      account: client.account.address,
      token: quote,
    })
    expect(dexBalanceAfter).toBeGreaterThan(0n)
  })

  test('behavior: only maker can cancel', async () => {
    const { base } = await setupTokenPair(client)

    // Account places order
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })

    // Create another account
    const account2 = accounts[1]

    // Transfer gas to account2
    await Actions.token.transferSync(client, {
      to: account2.address,
      amount: parseUnits('1', 6),
      token: 1n,
    })

    // Account2 tries to cancel - should fail
    await expect(
      Actions.dex.cancelSync(client, {
        account: account2,
        orderId,
      }),
    ).rejects.toThrow('Execution reverted')
  })

  test('behavior: cannot cancel non-existent order', async () => {
    await setupTokenPair(client)

    // Try to cancel an order that doesn't exist
    await expect(
      Actions.dex.cancelSync(client, {
        orderId: 999n,
      }),
    ).rejects.toThrow('The contract function "cancel" reverted')
  })
})

describe('createPair', () => {
  test('default', async () => {
    const { token: baseToken } = await Actions.token.createSync(client, {
      name: 'Test Base Token',
      symbol: 'BASE',
      currency: 'USD',
    })

    const { receipt, key, base, quote } = await Actions.dex.createPairSync(
      client,
      {
        base: baseToken,
      },
    )

    expect(receipt).toBeDefined()
    expect(receipt.status).toBe('success')
    expect(key).toBeDefined()
    expect(base).toBe(baseToken)
    expect(quote).toBeDefined()
  })
})

describe('getBalance', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Initial balance should be 0
    const initialBalance = await Actions.dex.getBalance(client, {
      account: client.account.address,
      token: quote,
    })
    expect(initialBalance).toBe(0n)

    // Place and cancel order to create internal balance
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.0005'),
    })

    await Actions.dex.cancelSync(client, {
      orderId,
    })

    // Now balance should be > 0 (refunded quote tokens)
    const balance = await Actions.dex.getBalance(client, {
      account: client.account.address,
      token: quote,
    })
    expect(balance).toBeGreaterThan(0n)
  })

  test('behavior: check different account', async () => {
    const { quote } = await setupTokenPair(client)

    const account2 = accounts[1]

    // Check account2's balance (should be 0)
    const balance = await Actions.dex.getBalance(client, {
      account: account2.address,
      token: quote,
    })
    expect(balance).toBe(0n)
  })

  test('behavior: balances are per-token', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Create balance in quote token
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })
    await Actions.dex.cancelSync(client, { orderId })

    // Check quote balance (should have refunded tokens)
    const quoteBalance = await Actions.dex.getBalance(client, {
      account: client.account.address,
      token: quote,
    })
    expect(quoteBalance).toBeGreaterThan(0n)

    // Check base balance (should still be 0)
    const baseBalance = await Actions.dex.getBalance(client, {
      account: client.account.address,
      token: base,
    })
    expect(baseBalance).toBe(0n)
  })
})

describe('getBuyQuote', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place ask orders to create liquidity
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'sell',
      tick: Tick.fromPrice('1.001'),
    })

    // Get quote for buying base tokens
    const amountIn = await Actions.dex.getBuyQuote(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: parseUnits('100', 6),
    })

    expect(amountIn).toBeGreaterThan(0n)
    // Should be approximately 100 * 1.001 = 100.1
    expect(amountIn).toBeGreaterThan(parseUnits('100', 6))
  })

  test('behavior: fails with no liquidity', async () => {
    const { base, quote } = await setupTokenPair(client)

    // No orders placed - no liquidity

    // Quote should fail
    await expect(
      Actions.dex.getBuyQuote(client, {
        tokenIn: quote,
        tokenOut: base,
        amountOut: parseUnits('100', 6),
      }),
    ).rejects.toThrow(
      'The contract function "quoteSwapExactAmountOut" reverted',
    )
  })
})

describe('getOrder', () => {
  test('default', async () => {
    const { base } = await setupTokenPair(client)

    // Place an order to get an order ID
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })

    // Get the order details
    const order = await Actions.dex.getOrder(client, {
      orderId,
    })

    expect(order).toBeDefined()
    expect(order.maker).toBe(client.account.address)
    expect(order.isBid).toBe(true)
    expect(order.tick).toBe(Tick.fromPrice('1.001'))
    expect(order.amount).toBe(parseUnits('100', 6))
    expect(order.remaining).toBe(parseUnits('100', 6))
    expect(order.isFlip).toBe(false)
  })

  test('behavior: returns flip order details', async () => {
    const { base } = await setupTokenPair(client)

    // Place a flip order
    const { orderId } = await Actions.dex.placeFlipSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
      flipTick: Tick.fromPrice('1.002'),
    })

    // Get the order details
    const order = await Actions.dex.getOrder(client, {
      orderId,
    })

    expect(order).toBeDefined()
    expect(order.maker).toBe(client.account.address)
    expect(order.isBid).toBe(true)
    expect(order.tick).toBe(Tick.fromPrice('1.001'))
    expect(order.amount).toBe(parseUnits('100', 6))
    expect(order.isFlip).toBe(true)
    expect(order.flipTick).toBe(Tick.fromPrice('1.002'))
  })

  test('behavior: fails for non-existent order', async () => {
    await setupTokenPair(client)

    // Try to get an order that doesn't exist
    await expect(
      Actions.dex.getOrder(client, {
        orderId: 999n,
      }),
    ).rejects.toThrow('The contract function "getOrder" reverted')
  })

  test('behavior: reflects order state after partial fill', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place a large sell order
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'sell',
      tick: Tick.fromPrice('1.001'),
    })

    // Get initial order state
    const orderBefore = await Actions.dex.getOrder(client, {
      orderId,
    })
    expect(orderBefore.amount).toBe(parseUnits('500', 6))
    expect(orderBefore.remaining).toBe(parseUnits('500', 6))

    // Partially fill the order with a buy
    await Actions.dex.buySync(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: parseUnits('100', 6),
      maxAmountIn: parseUnits('150', 6),
    })

    // Get order state after partial fill
    const orderAfter = await Actions.dex.getOrder(client, {
      orderId,
    })
    expect(orderAfter.amount).toBe(parseUnits('500', 6)) // amount unchanged
    expect(orderAfter.remaining).toBeLessThan(parseUnits('500', 6)) // remaining decreased
  })

  test('behavior: linked list pointers for multiple orders at same tick', async () => {
    const { base } = await setupTokenPair(client)

    const tick = Tick.fromPrice('1.001')

    // Place first order
    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Place second order at same tick
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Get first order
    const order1 = await Actions.dex.getOrder(client, {
      orderId: orderId1,
    })
    expect(order1.prev).toBe(0n) // should be 0 as it's first
    expect(order1.next).toBe(orderId2) // should point to second order

    // Get second order
    const order2 = await Actions.dex.getOrder(client, {
      orderId: orderId2,
    })
    expect(order2.prev).toBe(orderId1) // should point to first order
    expect(order2.next).toBe(0n) // should be 0 as it's last
  })
})

describe('getOrderbook', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Get orderbook information
    const book = await Actions.dex.getOrderbook(client, {
      base,
      quote,
    })

    expect(book).toBeDefined()
    expect(book.base).toBe(base)
    expect(book.quote).toBe(quote)
    expect(book.bestBidTick).toBeDefined()
    expect(book.bestAskTick).toBeDefined()
  })

  test('behavior: shows best bid and ask after orders placed', async () => {
    const { base, quote } = await setupTokenPair(client)

    const bidTick = Tick.fromPrice('0.999')
    const askTick = Tick.fromPrice('1.001')

    // Place a bid order
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: bidTick,
    })

    // Place an ask order
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'sell',
      tick: askTick,
    })

    // Get orderbook
    const book = await Actions.dex.getOrderbook(client, {
      base,
      quote,
    })

    expect(book.bestBidTick).toBe(bidTick)
    expect(book.bestAskTick).toBe(askTick)
  })

  test('behavior: best ticks update after better orders placed', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place initial bid at 0.999
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('0.999'),
    })

    // Get orderbook
    const bookBefore = await Actions.dex.getOrderbook(client, {
      base,
      quote,
    })
    expect(bookBefore.bestBidTick).toBe(Tick.fromPrice('0.999'))

    // Place better bid at 1.0
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.0'),
    })

    // Get orderbook again
    const bookAfter = await Actions.dex.getOrderbook(client, {
      base,
      quote,
    })
    expect(bookAfter.bestBidTick).toBe(Tick.fromPrice('1.0'))
  })

  test.skip('behavior: best ticks update after order cancellation', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place two bid orders at different ticks
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('0.999'),
    })

    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.0'),
    })

    // Get orderbook - best bid should be 1.0
    const bookBefore = await Actions.dex.getOrderbook(client, {
      base,
      quote,
    })
    expect(bookBefore.bestBidTick).toBe(Tick.fromPrice('1.0'))

    // Cancel the better order
    await Actions.dex.cancelSync(client, { orderId })

    // Get orderbook again - best bid should fall back to 0.999
    const bookAfter = await Actions.dex.getOrderbook(client, {
      base,
      quote,
    })
    expect(bookAfter.bestBidTick).toBe(Tick.fromPrice('0.999'))
  })

  test('behavior: multiple pairs have independent orderbooks', async () => {
    const { base: base1, quote: quote1 } = await setupTokenPair(client)
    const { base: base2, quote: quote2 } = await setupTokenPair(client)

    // Place order on first pair
    await Actions.dex.placeSync(client, {
      token: base1,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })

    // Place order on second pair at different tick
    await Actions.dex.placeSync(client, {
      token: base2,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('0.999'),
    })

    // Get orderbooks
    const book1 = await Actions.dex.getOrderbook(client, {
      base: base1,
      quote: quote1,
    })

    const book2 = await Actions.dex.getOrderbook(client, {
      base: base2,
      quote: quote2,
    })

    // Each pair should have its own best tick
    expect(book1.bestBidTick).toBe(Tick.fromPrice('1.001'))
    expect(book2.bestBidTick).toBe(Tick.fromPrice('0.999'))
  })
})

describe('getTickLevel', () => {
  test('default', async () => {
    const { base } = await setupTokenPair(client)

    const tick = Tick.fromPrice('1.001')

    // Place an order to create liquidity at this tick
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Get the price level
    const level = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: true,
    })

    expect(level).toBeDefined()
    expect(level.head).toBe(orderId) // head should be our order
    expect(level.tail).toBe(orderId) // tail should also be our order (only one)
    expect(level.totalLiquidity).toBeGreaterThan(0n)
  })

  test('behavior: empty price level', async () => {
    const { base } = await setupTokenPair(client)

    const tick = Tick.fromPrice('1.001')

    // Query a tick with no orders
    const level = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: true,
    })

    expect(level).toBeDefined()
    expect(level.head).toBe(0n)
    expect(level.tail).toBe(0n)
    expect(level.totalLiquidity).toBe(0n)
  })

  test('behavior: multiple orders at same tick', async () => {
    const { base } = await setupTokenPair(client)

    const tick = Tick.fromPrice('1.001')

    // Place first order
    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Place second order at same tick
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Get the price level
    const level = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: true,
    })

    expect(level.head).toBe(orderId1) // head should be first order
    expect(level.tail).toBe(orderId2) // tail should be last order
    // Total liquidity should be sum of both orders (approximately)
    expect(level.totalLiquidity).toBeGreaterThan(parseUnits('145', 6))
  })

  test('behavior: bid vs ask sides', async () => {
    const { base } = await setupTokenPair(client)

    const tick = Tick.fromPrice('1.001')

    // Place a buy order (bid)
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Place a sell order (ask) at same tick
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'sell',
      tick,
    })

    // Get bid side
    const bidLevel = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: true,
    })

    // Get ask side
    const askLevel = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: false,
    })

    // Both should have liquidity but different amounts
    expect(bidLevel.totalLiquidity).toBeGreaterThan(0n)
    expect(askLevel.totalLiquidity).toBeGreaterThan(0n)
    expect(bidLevel.head).not.toBe(askLevel.head)
  })

  test('behavior: liquidity changes after order cancellation', async () => {
    const { base } = await setupTokenPair(client)

    const tick = Tick.fromPrice('1.001')

    // Place orders
    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Get level before cancellation
    const levelBefore = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: true,
    })

    // Cancel first order
    await Actions.dex.cancelSync(client, {
      orderId: orderId1,
    })

    // Get level after cancellation
    const levelAfter = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: true,
    })

    // Total liquidity should decrease
    expect(levelAfter.totalLiquidity).toBeLessThan(levelBefore.totalLiquidity)
  })

  test('behavior: liquidity changes after partial fill', async () => {
    const { base, quote } = await setupTokenPair(client)

    const tick = Tick.fromPrice('1.001')

    // Place sell order
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'sell',
      tick,
    })

    // Get level before fill
    const levelBefore = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: false,
    })

    // Partially fill the order
    await Actions.dex.buySync(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: parseUnits('100', 6),
      maxAmountIn: parseUnits('150', 6),
    })

    // Get level after fill
    const levelAfter = await Actions.dex.getTickLevel(client, {
      base,
      tick,
      isBid: false,
    })

    // Total liquidity should decrease
    expect(levelAfter.totalLiquidity).toBeLessThan(levelBefore.totalLiquidity)
  })

  test('behavior: tick at boundaries', async () => {
    const { base } = await setupTokenPair(client)

    // Place order at min tick
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'sell',
      tick: Tick.minTick,
    })

    // Query min tick
    const minLevel = await Actions.dex.getTickLevel(client, {
      base,
      tick: Tick.minTick,
      isBid: false,
    })
    expect(minLevel.totalLiquidity).toBeGreaterThan(0n)

    // Place order at max tick
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.maxTick,
    })

    // Query max tick
    const maxLevel = await Actions.dex.getTickLevel(client, {
      base,
      tick: Tick.maxTick,
      isBid: true,
    })
    expect(maxLevel.totalLiquidity).toBeGreaterThan(0n)
  })
})

describe('getSellQuote', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place bid orders to create liquidity
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'buy',
      tick: Tick.fromPrice('0.999'),
    })

    // Get quote for selling base tokens
    const amountOut = await Actions.dex.getSellQuote(client, {
      tokenIn: base,
      tokenOut: quote,
      amountIn: parseUnits('100', 6),
    })

    expect(amountOut).toBeGreaterThan(0n)
    // Should be approximately 100 * 0.999 = 99.9
    expect(amountOut).toBeLessThan(parseUnits('100', 6))
  })

  test('behavior: fails with no liquidity', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Quote should fail with no liquidity
    await expect(
      Actions.dex.getSellQuote(client, {
        tokenIn: base,
        tokenOut: quote,
        amountIn: parseUnits('100', 6),
      }),
    ).rejects.toThrow('The contract function "quoteSwapExactAmountIn" reverted')
  })
})

describe('place', () => {
  test('default', async () => {
    // Setup token pair
    const { base } = await setupTokenPair(client)

    // Place a sell order
    const { receipt, orderId, token, ...result } = await Actions.dex.placeSync(
      client,
      {
        token: base,
        amount: parseUnits('100', 6),
        type: 'sell',
        tick: Tick.fromPrice('1.001'),
      },
    )

    expect(receipt).toBeDefined()
    expect(receipt.status).toBe('success')
    expect(orderId).toBeGreaterThan(0n)
    expect(token).toBe(base)
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "isBid": false,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "tick": 100,
      }
    `)

    // Place a buy order
    const {
      receipt: receipt2,
      orderId: orderId2,
      token: token2,
      ...result2
    } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })
    expect(receipt2.status).toBe('success')
    expect(orderId2).toBeGreaterThan(0n)
    expect(token2).toBe(base)
    expect(result2).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "isBid": true,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "tick": 100,
      }
    `)
  })

  test('behavior: tick at boundaries', async () => {
    const { base } = await setupTokenPair(client)

    // Test at min tick (-2000)
    const { receipt: receipt1, ...result1 } = await Actions.dex.placeSync(
      client,
      {
        token: base,
        amount: parseUnits('100', 6),
        type: 'sell',
        tick: Tick.minTick,
      },
    )
    expect(receipt1.status).toBe('success')
    expect(result1.tick).toBe(-2000)

    // Test at max tick (2000)
    const { receipt: receipt2, ...result2 } = await Actions.dex.placeSync(
      client,
      {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.maxTick,
      },
    )
    expect(receipt2.status).toBe('success')
    expect(result2.tick).toBe(2000)
  })

  test('behavior: tick validation fails outside bounds', async () => {
    const { base } = await setupTokenPair(client)

    // Test tick above max tix should fail
    await expect(
      Actions.dex.placeSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.maxTick + 1,
      }),
    ).rejects.toThrow('The contract function "place" reverted')

    // Test tick below min tick should fail
    await expect(
      Actions.dex.placeSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'sell',
        tick: Tick.minTick - 1,
      }),
    ).rejects.toThrow('The contract function "place" reverted')
  })

  test('behavior: transfers from wallet', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Get balances before placing order
    const baseBalanceBefore = await Actions.token.getBalance(client, {
      token: base,
    })
    const quoteBalanceBefore = await Actions.token.getBalance(client, {
      token: quote,
    })

    // Place a buy order - should transfer quote tokens to escrow
    const orderAmount = parseUnits('100', 6)
    const tick = Tick.fromPrice('1.001')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: orderAmount,
      type: 'buy',
      tick,
    })

    // Get balances after placing order
    const baseBalanceAfter = await Actions.token.getBalance(client, {
      token: base,
    })
    const quoteBalanceAfter = await Actions.token.getBalance(client, {
      token: quote,
    })

    // Base token balance should be unchanged (we're buying base, not selling)
    expect(baseBalanceAfter).toBe(baseBalanceBefore)

    // Quote token balance should decrease (escrowed for the bid)
    // Amount = orderAmount * (1 + tick/1000) for bids
    const expectedQuoteEscrowed =
      (orderAmount * BigInt(100000 + tick)) / BigInt(100000)
    expect(quoteBalanceBefore - quoteBalanceAfter).toBeGreaterThanOrEqual(
      expectedQuoteEscrowed,
    )
  })

  test('behavior: multiple orders at same tick', async () => {
    const { base } = await setupTokenPair(client)

    const tick = Tick.fromPrice('1.0005')

    // Place first order
    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Place second order at same tick
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick,
    })

    // Order IDs should be different and sequential
    expect(orderId2).toBeGreaterThan(orderId1)
  })
})

describe('placeFlip', () => {
  test('default', async () => {
    const { base } = await setupTokenPair(client)

    // Place a flip bid order
    const { receipt, orderId, token, ...result } =
      await Actions.dex.placeFlipSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.fromPrice('1.001'),
        flipTick: Tick.fromPrice('1.002'),
      })

    expect(receipt).toBeDefined()
    expect(receipt.status).toBe('success')
    expect(orderId).toBeGreaterThan(0n)
    expect(token).toBe(base)
    expect(result.flipTick).toBe(Tick.fromPrice('1.002'))
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "flipTick": 200,
        "isBid": true,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "tick": 100,
      }
    `)
  })

  test('behavior: flip bid requires flipTick > tick', async () => {
    const { base } = await setupTokenPair(client)

    // Valid: flipTick > tick for bid
    const { receipt: receipt1 } = await Actions.dex.placeFlipSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.0005'),
      flipTick: Tick.fromPrice('1.001'),
    })
    expect(receipt1.status).toBe('success')

    // Invalid: flipTick <= tick for bid should fail
    await expect(
      Actions.dex.placeFlipSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.fromPrice('1.001'),
        flipTick: Tick.fromPrice('1.001'), // Equal
      }),
    ).rejects.toThrow('The contract function "placeFlip" reverted')

    await expect(
      Actions.dex.placeFlipSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.fromPrice('1.001'),
        flipTick: Tick.fromPrice('1.0005'), // Less than
      }),
    ).rejects.toThrow('The contract function "placeFlip" reverted')
  })

  test('behavior: flip ask requires flipTick < tick', async () => {
    const { base } = await setupTokenPair(client)

    // Valid: flipTick < tick for ask
    const { receipt: receipt1 } = await Actions.dex.placeFlipSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'sell',
      tick: Tick.fromPrice('1.001'),
      flipTick: Tick.fromPrice('1.0005'),
    })
    expect(receipt1.status).toBe('success')

    // Invalid: flipTick >= tick for ask should fail
    await expect(
      Actions.dex.placeFlipSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'sell',
        tick: Tick.fromPrice('1.0005'),
        flipTick: Tick.fromPrice('1.0005'), // Equal
      }),
    ).rejects.toThrow('The contract function "placeFlip" reverted')

    await expect(
      Actions.dex.placeFlipSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'sell',
        tick: Tick.fromPrice('1.0005'),
        flipTick: Tick.fromPrice('1.001'), // Greater than
      }),
    ).rejects.toThrow('The contract function "placeFlip" reverted')
  })

  test('behavior: flip ticks at boundaries', async () => {
    const { base } = await setupTokenPair(client)

    // Flip order with ticks at extreme boundaries
    const { receipt } = await Actions.dex.placeFlipSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.minTick,
      flipTick: Tick.maxTick,
    })
    expect(receipt.status).toBe('success')
  })
})

describe('sell', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place bid order to create liquidity
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'buy',
      tick: Tick.fromPrice('0.999'),
    })

    // Sell base tokens
    const { receipt } = await Actions.dex.sellSync(client, {
      tokenIn: base,
      tokenOut: quote,
      amountIn: parseUnits('100', 6),
      minAmountOut: parseUnits('50', 6),
    })

    expect(receipt).toBeDefined()
    expect(receipt.status).toBe('success')
  })

  test('behavior: respects minAmountOut', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Place bid order at low price
    await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'buy',
      tick: Tick.fromPrice('0.99'), // 1% below peg
    })

    // Try to sell with too high minAmountOut - should fail
    await expect(
      Actions.dex.sellSync(client, {
        tokenIn: base,
        tokenOut: quote,
        amountIn: parseUnits('100', 6),
        minAmountOut: parseUnits('150', 6), // Way too high
      }),
    ).rejects.toThrow('The contract function "swapExactAmountIn" reverted')
  })

  test('behavior: fails with insufficient liquidity', async () => {
    const { base, quote } = await setupTokenPair(client)

    // No orders - no liquidity

    // Try to sell - should fail
    await expect(
      Actions.dex.sellSync(client, {
        tokenIn: base,
        tokenOut: quote,
        amountIn: parseUnits('100', 6),
        minAmountOut: parseUnits('100', 6),
      }),
    ).rejects.toThrow('The contract function "swapExactAmountIn" reverted')
  })
})

describe('watchFlipOrderPlaced', () => {
  test('default', async () => {
    const { base } = await setupTokenPair(client)

    const receivedOrders: Array<{
      args: Actions.dex.watchFlipOrderPlaced.Args
      log: Actions.dex.watchFlipOrderPlaced.Log
    }> = []

    const unwatch = Actions.dex.watchFlipOrderPlaced(client, {
      onFlipOrderPlaced: (args, log) => {
        receivedOrders.push({ args, log })
      },
    })

    try {
      // Place flip order
      await Actions.dex.placeFlipSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.fromPrice('1.001'),
        flipTick: Tick.fromPrice('1.002'),
      })

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(receivedOrders).toHaveLength(1)
      expect(receivedOrders[0]?.args.flipTick).toBe(Tick.fromPrice('1.002'))
      expect(receivedOrders[0]?.args.tick).toBe(Tick.fromPrice('1.001'))
    } finally {
      unwatch()
    }
  })
})

describe('watchOrderCancelled', () => {
  test('default', async () => {
    const { base } = await setupTokenPair(client)

    const receivedCancellations: Array<{
      args: Actions.dex.watchOrderCancelled.Args
      log: Actions.dex.watchOrderCancelled.Log
    }> = []

    const unwatch = Actions.dex.watchOrderCancelled(client, {
      onOrderCancelled: (args, log) => {
        receivedCancellations.push({ args, log })
      },
    })

    try {
      // Place order
      const { orderId } = await Actions.dex.placeSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.fromPrice('1.001'),
      })

      // Cancel order
      await Actions.dex.cancelSync(client, {
        orderId,
      })

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(receivedCancellations).toHaveLength(1)
      expect(receivedCancellations[0]?.args.orderId).toBe(orderId)
    } finally {
      unwatch()
    }
  })

  test('behavior: filter by orderId', async () => {
    const { base } = await setupTokenPair(client)

    // Place two orders
    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })

    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })

    const receivedCancellations: Array<{
      args: Actions.dex.watchOrderCancelled.Args
      log: Actions.dex.watchOrderCancelled.Log
    }> = []

    // Watch only for cancellation of orderId1
    const unwatch = Actions.dex.watchOrderCancelled(client, {
      orderId: orderId1,
      onOrderCancelled: (args, log) => {
        receivedCancellations.push({ args, log })
      },
    })

    try {
      // Cancel orderId1 (should be captured)
      await Actions.dex.cancelSync(client, {
        orderId: orderId1,
      })

      // Cancel orderId2 (should NOT be captured)
      await Actions.dex.cancelSync(client, {
        orderId: orderId2,
      })

      await new Promise((resolve) => setTimeout(resolve, 200))

      // Should only receive 1 event
      expect(receivedCancellations).toHaveLength(1)
      expect(receivedCancellations[0]?.args.orderId).toBe(orderId1)
    } finally {
      unwatch()
    }
  })
})

describe.todo('watchOrderFilled')

describe('watchOrderPlaced', () => {
  test('default', async () => {
    const { base } = await setupTokenPair(client)

    const receivedOrders: Array<{
      args: Actions.dex.watchOrderPlaced.Args
      log: Actions.dex.watchOrderPlaced.Log
    }> = []

    const unwatch = Actions.dex.watchOrderPlaced(client, {
      onOrderPlaced: (args, log) => {
        receivedOrders.push({ args, log })
      },
    })

    try {
      // Place first order
      await Actions.dex.placeSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.fromPrice('1.001'),
      })

      // Place second order
      await Actions.dex.placeSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'sell',
        tick: Tick.fromPrice('0.999'),
      })

      // Wait for events
      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(receivedOrders).toHaveLength(2)
      expect(receivedOrders[0]?.args.isBid).toBe(true)
      expect(receivedOrders[0]?.args.amount).toBe(parseUnits('100', 6))
      expect(receivedOrders[1]?.args.isBid).toBe(false)
      expect(receivedOrders[1]?.args.amount).toBe(parseUnits('100', 6))
    } finally {
      unwatch()
    }
  })

  test('behavior: filter by token', async () => {
    const { base } = await setupTokenPair(client)
    const { base: base2 } = await setupTokenPair(client)

    const receivedOrders: Array<{
      args: Actions.dex.watchOrderPlaced.Args
      log: Actions.dex.watchOrderPlaced.Log
    }> = []

    // Watch only for orders on base
    const unwatch = Actions.dex.watchOrderPlaced(client, {
      token: base,
      onOrderPlaced: (args, log) => {
        receivedOrders.push({ args, log })
      },
    })

    try {
      // Place order on base (should be captured)
      await Actions.dex.placeSync(client, {
        token: base,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.fromPrice('1.001'),
      })

      // Place order on base2 (should NOT be captured)
      await Actions.dex.placeSync(client, {
        token: base2,
        amount: parseUnits('100', 6),
        type: 'buy',
        tick: Tick.fromPrice('1.001'),
      })

      await new Promise((resolve) => setTimeout(resolve, 200))

      // Should only receive 1 event
      expect(receivedOrders).toHaveLength(1)
      expect(receivedOrders[0]?.args.token.toLowerCase()).toBe(
        base.toLowerCase(),
      )
    } finally {
      unwatch()
    }
  })
})

describe('withdraw', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair(client)

    // Create internal balance
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('1.001'),
    })

    await Actions.dex.cancelSync(client, { orderId })

    // Get DEX balance
    const dexBalance = await Actions.dex.getBalance(client, {
      account: client.account.address,
      token: quote,
    })
    expect(dexBalance).toBeGreaterThan(0n)

    // Get wallet balance before withdraw
    const walletBalanceBefore = await Actions.token.getBalance(client, {
      token: quote,
    })

    // Withdraw from DEX
    const { receipt } = await Actions.dex.withdrawSync(client, {
      token: quote,
      amount: dexBalance,
    })

    expect(receipt).toBeDefined()
    expect(receipt.status).toBe('success')

    // Check DEX balance is now 0
    const dexBalanceAfter = await Actions.dex.getBalance(client, {
      account: client.account.address,
      token: quote,
    })
    expect(dexBalanceAfter).toBe(0n)

    // Check wallet balance increased
    const walletBalanceAfter = await Actions.token.getBalance(client, {
      token: quote,
    })
    expect(walletBalanceAfter).toBeGreaterThan(walletBalanceBefore)
  })
})
