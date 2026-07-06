import * as tempo from '~test/tempo.js'
import * as AbiEvent from 'ox/AbiEvent'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import { describe, expect, test } from 'vitest'

import { Account, Actions as CoreActions } from 'viem'
import { Abis, Actions, Addresses, Tick } from 'viem/tempo'

const client = tempo.getClient()
const client2 = tempo.getClient({
  account: Account.fromPrivateKey(tempo.accounts[1].privateKey),
})

/** Creates a fresh base/quote token pair: minted, DEX-approved, pair created. */
async function setupPair() {
  const { token: quoteToken } = await Actions.token.createSync(client, {
    currency: 'USD',
    feeToken: tempo.alphaUsd,
    name: 'Test Quote Token',
    symbol: 'QUOTE',
  } as never)
  const { token: baseToken } = await Actions.token.createSync(client, {
    currency: 'USD',
    feeToken: tempo.alphaUsd,
    name: 'Test Base Token',
    quoteToken,
    symbol: 'BASE',
  } as never)
  for (const token of [baseToken, quoteToken]) {
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client.account!.address,
      token,
    } as never)
    await Actions.token.mintSync(client, {
      amount: 10_000_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)
    await Actions.token.approveSync(client, {
      amount: 10_000_000_000n,
      feeToken: tempo.alphaUsd,
      spender: Addresses.stablecoinDex,
      token,
    } as never)
  }
  const { base, key, quote } = await Actions.dex.createPairSync(client, {
    base: baseToken,
    feeToken: tempo.alphaUsd,
  } as never)
  return { base, key, quote }
}

/** Creates a blacklist policy administered by account 0. */
async function createBlacklistPolicy() {
  const receipt = await CoreActions.contract.writeSync(client, {
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    args: [client.account!.address, 1],
    feeToken: tempo.alphaUsd,
    functionName: 'createPolicy',
  } as never)
  const [log] = AbiEvent.extractLogs(Abis.tip403Registry, receipt.logs, {
    eventName: 'PolicyCreated',
    strict: true,
  })
  return log!.args.policyId
}

/** Funds `to` with alphaUSD for fee payment. */
async function fund(to: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: 50_000_000n,
    feeToken: tempo.alphaUsd,
    to,
    token: tempo.alphaUsd,
  } as never)
}

/** Waits until `done` returns true, polling every 100ms (5s cap). */
async function waitFor(done: () => boolean) {
  for (let i = 0; i < 50 && !done(); i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('buy', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    // Ask-side liquidity to buy from.
    await Actions.dex.placeSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'sell',
    } as never)

    const balanceBefore = await Actions.token.getBalance(client, {
      token: base,
    })

    const { receipt } = await Actions.dex.buySync(client, {
      amountOut: 100_000_000n,
      feeToken: tempo.alphaUsd,
      maxAmountIn: 150_000_000n,
      tokenIn: quote,
      tokenOut: base,
    } as never)
    expect(receipt.status).toBe('success')

    const balanceAfter = await Actions.token.getBalance(client, {
      token: base,
    })
    expect(balanceAfter.amount).toBe(balanceBefore.amount + 100_000_000n)
  })

  test('behavior: respects maxAmountIn', async () => {
    const { base, quote } = await setupPair()

    // Ask priced 1% above peg.
    await Actions.dex.placeSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.01'),
      token: base,
      type: 'sell',
    } as never)

    await expect(
      Actions.dex.buySync(client, {
        amountOut: 100_000_000n,
        feeToken: tempo.alphaUsd,
        maxAmountIn: 100_000_000n,
        tokenIn: quote,
        tokenOut: base,
      } as never),
    ).rejects.toThrow('error MaxInputExceeded()')
  })

  test('behavior: fails with insufficient liquidity', async () => {
    const { base, quote } = await setupPair()

    await expect(
      Actions.dex.buySync(client, {
        amountOut: 100_000_000n,
        feeToken: tempo.alphaUsd,
        maxAmountIn: 150_000_000n,
        tokenIn: quote,
        tokenOut: base,
      } as never),
    ).rejects.toThrow('error InsufficientLiquidity()')
  })
})

describe('cancel', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)

    await expect(
      Actions.dex.getBalance(client, { token: quote }),
    ).resolves.toBe(0n)

    const { orderId: cancelledOrderId, receipt } = await Actions.dex.cancelSync(
      client,
      {
        feeToken: tempo.alphaUsd,
        orderId,
      } as never,
    )
    expect(receipt.status).toBe('success')
    expect(cancelledOrderId).toBe(orderId)

    // The escrowed quote tokens are refunded to the internal DEX balance.
    await expect(
      Actions.dex.getBalance(client, { token: quote }),
    ).resolves.toMatchInlineSnapshot(`100100000n`)
  })

  test('behavior: only maker can cancel', async () => {
    const { base } = await setupPair()

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)

    await fund(client2.account!.address)

    await expect(
      Actions.dex.cancelSync(client2, {
        feeToken: tempo.alphaUsd,
        orderId,
      } as never),
    ).rejects.toThrow('error Unauthorized()')
  })

  test('behavior: cannot cancel non-existent order', async () => {
    await setupPair()

    await expect(
      Actions.dex.cancelSync(client, {
        feeToken: tempo.alphaUsd,
        orderId: 999_999_999n,
      } as never),
    ).rejects.toThrow('error OrderDoesNotExist()')
  })
})

describe('cancelStale', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    const policyId = await createBlacklistPolicy()
    await Actions.token.changeTransferPolicySync(client, {
      feeToken: tempo.alphaUsd,
      policyId,
      token: quote,
    } as never)

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)

    // Blacklisting the maker makes the order stale.
    await CoreActions.contract.writeSync(client, {
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [policyId, client.account!.address, true],
      feeToken: tempo.alphaUsd,
      functionName: 'modifyPolicyBlacklist',
    } as never)

    const { orderId: cancelledOrderId, receipt } =
      await Actions.dex.cancelStaleSync(client, {
        feeToken: tempo.alphaUsd,
        orderId,
      } as never)
    expect(receipt.status).toBe('success')
    expect(cancelledOrderId).toBe(orderId)
  })

  test('behavior: cannot cancel non-stale order', async () => {
    const { base } = await setupPair()

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)

    await expect(
      Actions.dex.cancelStaleSync(client, {
        feeToken: tempo.alphaUsd,
        orderId,
      } as never),
    ).rejects.toThrow('error OrderNotStale()')
  })
})

describe('createPair', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      feeToken: tempo.alphaUsd,
      name: 'Test Base Token',
      symbol: 'BASE',
    } as never)

    const { base, key, quote, receipt } = await Actions.dex.createPairSync(
      client,
      {
        base: token,
        feeToken: tempo.alphaUsd,
      } as never,
    )

    expect(receipt.status).toBe('success')
    expect(base).toBe(token)
    expect(quote.toLowerCase()).toBe(tempo.pathUsd)
    expect(key).toBe(Hash.keccak256(Hex.concat(base, quote)))
  })
})

describe('getBalance', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    await expect(
      Actions.dex.getBalance(client, { token: quote }),
    ).resolves.toBe(0n)

    // Cancelling a bid refunds the escrowed quote to the internal balance.
    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.0005'),
      token: base,
      type: 'buy',
    } as never)
    await Actions.dex.cancelSync(client, {
      feeToken: tempo.alphaUsd,
      orderId,
    } as never)

    await expect(
      Actions.dex.getBalance(client, { token: quote }),
    ).resolves.toMatchInlineSnapshot(`100050000n`)
  })

  test('behavior: check different account', async () => {
    const { quote } = await setupPair()

    await expect(
      Actions.dex.getBalance(client, {
        account: tempo.accounts[1].address,
        token: quote,
      }),
    ).resolves.toBe(0n)
  })

  test('behavior: balances are per-token', async () => {
    const { base, quote } = await setupPair()

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)
    await Actions.dex.cancelSync(client, {
      feeToken: tempo.alphaUsd,
      orderId,
    } as never)

    await expect(
      Actions.dex.getBalance(client, { token: quote }),
    ).resolves.toMatchInlineSnapshot(`100100000n`)
    await expect(Actions.dex.getBalance(client, { token: base })).resolves.toBe(
      0n,
    )
  })
})

describe('getBuyQuote', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    await Actions.dex.placeSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'sell',
    } as never)

    await expect(
      Actions.dex.getBuyQuote(client, {
        amountOut: 100_000_000n,
        tokenIn: quote,
        tokenOut: base,
      }),
    ).resolves.toMatchInlineSnapshot(`100100000n`)
  })

  test('behavior: fails with no liquidity', async () => {
    const { base, quote } = await setupPair()

    await expect(
      Actions.dex.getBuyQuote(client, {
        amountOut: 100_000_000n,
        tokenIn: quote,
        tokenOut: base,
      }),
    ).rejects.toThrow(
      'The contract function "quoteSwapExactAmountOut" reverted',
    )
  })
})

describe('getOrder', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)

    const {
      bookKey,
      orderId: returnedOrderId,
      ...order
    } = await Actions.dex.getOrder(client, { orderId })
    expect(returnedOrderId).toBe(orderId)
    expect(bookKey).toBe(Hash.keccak256(Hex.concat(base, quote)))
    expect(order).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "flipTick": 0,
        "isBid": true,
        "isFlip": false,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "next": 0n,
        "prev": 0n,
        "remaining": 100000000n,
        "tick": 100,
      }
    `)
  })

  test('behavior: returns flip order details', async () => {
    const { base } = await setupPair()

    const { orderId } = await Actions.dex.placeFlipSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      flipTick: Tick.fromPrice('1.002'),
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)

    const {
      bookKey: _,
      orderId: returnedOrderId,
      ...order
    } = await Actions.dex.getOrder(client, { orderId })
    expect(returnedOrderId).toBe(orderId)
    expect(order).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "flipTick": 200,
        "isBid": true,
        "isFlip": true,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "next": 0n,
        "prev": 0n,
        "remaining": 100000000n,
        "tick": 100,
      }
    `)
  })

  test('behavior: fails for non-existent order', async () => {
    await setupPair()

    await expect(
      Actions.dex.getOrder(client, { orderId: 999_999_999n }),
    ).rejects.toThrow('The contract function "getOrder" reverted')
  })

  test('behavior: reflects order state after partial fill', async () => {
    const { base, quote } = await setupPair()

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'sell',
    } as never)

    const orderBefore = await Actions.dex.getOrder(client, { orderId })
    expect(orderBefore.amount).toBe(500_000_000n)
    expect(orderBefore.remaining).toBe(500_000_000n)

    await Actions.dex.buySync(client, {
      amountOut: 100_000_000n,
      feeToken: tempo.alphaUsd,
      maxAmountIn: 150_000_000n,
      tokenIn: quote,
      tokenOut: base,
    } as never)

    const orderAfter = await Actions.dex.getOrder(client, { orderId })
    expect(orderAfter.amount).toBe(500_000_000n)
    expect(orderAfter.remaining).toBe(400_000_000n)
  })

  test('behavior: linked list pointers for multiple orders at same tick', async () => {
    const { base } = await setupPair()

    const tick = Tick.fromPrice('1.001')

    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)

    const order1 = await Actions.dex.getOrder(client, { orderId: orderId1 })
    expect(order1.prev).toBe(0n)
    expect(order1.next).toBe(orderId2)

    const order2 = await Actions.dex.getOrder(client, { orderId: orderId2 })
    expect(order2.prev).toBe(orderId1)
    expect(order2.next).toBe(0n)
  })
})

describe('getOrderbook', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    const {
      base: bookBase,
      quote: bookQuote,
      ...book
    } = await Actions.dex.getOrderbook(client, { base, quote })
    expect(bookBase).toBe(base)
    expect(bookQuote).toBe(quote)
    expect(book).toMatchInlineSnapshot(`
      {
        "bestAskTick": 32767,
        "bestBidTick": -32768,
      }
    `)
  })

  test('behavior: shows best bid and ask after orders placed', async () => {
    const { base, quote } = await setupPair()

    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('0.999'),
      token: base,
      type: 'buy',
    } as never)
    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'sell',
    } as never)

    const book = await Actions.dex.getOrderbook(client, { base, quote })
    expect(book.bestBidTick).toBe(Tick.fromPrice('0.999'))
    expect(book.bestAskTick).toBe(Tick.fromPrice('1.001'))
  })

  test('behavior: best ticks update after better orders placed', async () => {
    const { base, quote } = await setupPair()

    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('0.999'),
      token: base,
      type: 'buy',
    } as never)

    const bookBefore = await Actions.dex.getOrderbook(client, { base, quote })
    expect(bookBefore.bestBidTick).toBe(Tick.fromPrice('0.999'))

    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.0'),
      token: base,
      type: 'buy',
    } as never)

    const bookAfter = await Actions.dex.getOrderbook(client, { base, quote })
    expect(bookAfter.bestBidTick).toBe(Tick.fromPrice('1.0'))
  })

  test('behavior: best ticks update after order cancellation', async () => {
    const { base, quote } = await setupPair()

    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('0.999'),
      token: base,
      type: 'buy',
    } as never)
    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.0'),
      token: base,
      type: 'buy',
    } as never)

    const bookBefore = await Actions.dex.getOrderbook(client, { base, quote })
    expect(bookBefore.bestBidTick).toBe(Tick.fromPrice('1.0'))

    await Actions.dex.cancelSync(client, {
      feeToken: tempo.alphaUsd,
      orderId,
    } as never)

    const bookAfter = await Actions.dex.getOrderbook(client, { base, quote })
    expect(bookAfter.bestBidTick).toBe(Tick.fromPrice('0.999'))
  })

  test('behavior: multiple pairs have independent orderbooks', async () => {
    const { base: base1, quote: quote1 } = await setupPair()
    const { base: base2, quote: quote2 } = await setupPair()

    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base1,
      type: 'buy',
    } as never)
    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('0.999'),
      token: base2,
      type: 'buy',
    } as never)

    const book1 = await Actions.dex.getOrderbook(client, {
      base: base1,
      quote: quote1,
    })
    const book2 = await Actions.dex.getOrderbook(client, {
      base: base2,
      quote: quote2,
    })

    expect(book1.bestBidTick).toBe(Tick.fromPrice('1.001'))
    expect(book2.bestBidTick).toBe(Tick.fromPrice('0.999'))
  })
})

describe('getTickLevel', () => {
  test('default', async () => {
    const { base } = await setupPair()

    const tick = Tick.fromPrice('1.001')

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)

    const { head, tail, totalLiquidity } = await Actions.dex.getTickLevel(
      client,
      {
        base,
        isBid: true,
        tick,
      },
    )
    expect(head).toBe(orderId)
    expect(tail).toBe(orderId)
    expect(totalLiquidity).toMatchInlineSnapshot(`100000000n`)
  })

  test('behavior: empty price level', async () => {
    const { base } = await setupPair()

    await expect(
      Actions.dex.getTickLevel(client, {
        base,
        isBid: true,
        tick: Tick.fromPrice('1.001'),
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "head": 0n,
        "tail": 0n,
        "totalLiquidity": 0n,
      }
    `)
  })

  test('behavior: multiple orders at same tick', async () => {
    const { base } = await setupPair()

    const tick = Tick.fromPrice('1.001')

    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)

    const { head, tail, totalLiquidity } = await Actions.dex.getTickLevel(
      client,
      {
        base,
        isBid: true,
        tick,
      },
    )
    expect(head).toBe(orderId1)
    expect(tail).toBe(orderId2)
    expect(totalLiquidity).toMatchInlineSnapshot(`200000000n`)
  })

  test('behavior: bid vs ask sides', async () => {
    const { base } = await setupPair()

    const tick = Tick.fromPrice('1.001')

    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)
    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'sell',
    } as never)

    const bidLevel = await Actions.dex.getTickLevel(client, {
      base,
      isBid: true,
      tick,
    })
    const askLevel = await Actions.dex.getTickLevel(client, {
      base,
      isBid: false,
      tick,
    })

    expect(bidLevel.totalLiquidity).toBeGreaterThan(0n)
    expect(askLevel.totalLiquidity).toBeGreaterThan(0n)
    expect(bidLevel.head).not.toBe(askLevel.head)
  })

  test('behavior: liquidity changes after order cancellation', async () => {
    const { base } = await setupPair()

    const tick = Tick.fromPrice('1.001')

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)
    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)

    const levelBefore = await Actions.dex.getTickLevel(client, {
      base,
      isBid: true,
      tick,
    })

    await Actions.dex.cancelSync(client, {
      feeToken: tempo.alphaUsd,
      orderId,
    } as never)

    const levelAfter = await Actions.dex.getTickLevel(client, {
      base,
      isBid: true,
      tick,
    })
    expect(levelAfter.totalLiquidity).toBeLessThan(levelBefore.totalLiquidity)
  })

  test('behavior: liquidity changes after partial fill', async () => {
    const { base, quote } = await setupPair()

    const tick = Tick.fromPrice('1.001')

    await Actions.dex.placeSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'sell',
    } as never)

    const levelBefore = await Actions.dex.getTickLevel(client, {
      base,
      isBid: false,
      tick,
    })

    await Actions.dex.buySync(client, {
      amountOut: 100_000_000n,
      feeToken: tempo.alphaUsd,
      maxAmountIn: 150_000_000n,
      tokenIn: quote,
      tokenOut: base,
    } as never)

    const levelAfter = await Actions.dex.getTickLevel(client, {
      base,
      isBid: false,
      tick,
    })
    expect(levelAfter.totalLiquidity).toBeLessThan(levelBefore.totalLiquidity)
  })

  test('behavior: tick at boundaries', async () => {
    const { base } = await setupPair()

    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.minTick,
      token: base,
      type: 'sell',
    } as never)

    const minLevel = await Actions.dex.getTickLevel(client, {
      base,
      isBid: false,
      tick: Tick.minTick,
    })
    expect(minLevel.totalLiquidity).toBeGreaterThan(0n)

    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.maxTick,
      token: base,
      type: 'buy',
    } as never)

    const maxLevel = await Actions.dex.getTickLevel(client, {
      base,
      isBid: true,
      tick: Tick.maxTick,
    })
    expect(maxLevel.totalLiquidity).toBeGreaterThan(0n)
  })
})

describe('getSellQuote', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    await Actions.dex.placeSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('0.999'),
      token: base,
      type: 'buy',
    } as never)

    await expect(
      Actions.dex.getSellQuote(client, {
        amountIn: 100_000_000n,
        tokenIn: base,
        tokenOut: quote,
      }),
    ).resolves.toMatchInlineSnapshot(`99900000n`)
  })

  test('behavior: fails with no liquidity', async () => {
    const { base, quote } = await setupPair()

    await expect(
      Actions.dex.getSellQuote(client, {
        amountIn: 100_000_000n,
        tokenIn: base,
        tokenOut: quote,
      }),
    ).rejects.toThrow('The contract function "quoteSwapExactAmountIn" reverted')
  })
})

describe('place', () => {
  test('default', async () => {
    const { base } = await setupPair()

    const { orderId, receipt, token, ...result } = await Actions.dex.placeSync(
      client,
      {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.fromPrice('1.001'),
        token: base,
        type: 'sell',
      } as never,
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
      orderId: orderId2,
      receipt: receipt2,
      token: token2,
      ...result2
    } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)
    expect(receipt2.status).toBe('success')
    expect(orderId2).toBeGreaterThan(orderId)
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
    const { base } = await setupPair()

    const { receipt, tick } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.minTick,
      token: base,
      type: 'sell',
    } as never)
    expect(receipt.status).toBe('success')
    expect(tick).toBe(Tick.minTick)

    const { receipt: receipt2, tick: tick2 } = await Actions.dex.placeSync(
      client,
      {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.maxTick,
        token: base,
        type: 'buy',
      } as never,
    )
    expect(receipt2.status).toBe('success')
    expect(tick2).toBe(Tick.maxTick)
  })

  test('behavior: tick validation fails outside bounds', async () => {
    const { base } = await setupPair()

    await expect(
      Actions.dex.placeSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.maxTick + 1,
        token: base,
        type: 'buy',
      } as never),
    ).rejects.toThrow('error TickOutOfBounds(int16 tick)')

    await expect(
      Actions.dex.placeSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.minTick - 1,
        token: base,
        type: 'sell',
      } as never),
    ).rejects.toThrow('error TickOutOfBounds(int16 tick)')
  })

  test('behavior: transfers from wallet', async () => {
    const { base, quote } = await setupPair()

    const baseBefore = await Actions.token.getBalance(client, { token: base })
    const quoteBefore = await Actions.token.getBalance(client, {
      token: quote,
    })

    // A bid escrows `amount * price` quote tokens.
    await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)

    const baseAfter = await Actions.token.getBalance(client, { token: base })
    const quoteAfter = await Actions.token.getBalance(client, {
      token: quote,
    })

    expect(baseAfter.amount).toBe(baseBefore.amount)
    expect(quoteBefore.amount - quoteAfter.amount).toMatchInlineSnapshot(
      `100100000n`,
    )
  })

  test('behavior: multiple orders at same tick', async () => {
    const { base } = await setupPair()

    const tick = Tick.fromPrice('1.0005')

    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick,
      token: base,
      type: 'buy',
    } as never)

    expect(orderId2).toBeGreaterThan(orderId1)
  })
})

describe('placeFlip', () => {
  test('default', async () => {
    const { base } = await setupPair()

    const { orderId, receipt, token, ...result } =
      await Actions.dex.placeFlipSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        flipTick: Tick.fromPrice('1.002'),
        tick: Tick.fromPrice('1.001'),
        token: base,
        type: 'buy',
      } as never)

    expect(receipt.status).toBe('success')
    expect(orderId).toBeGreaterThan(0n)
    expect(token).toBe(base)
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "flipTick": 200,
        "isBid": true,
        "isFlipOrder": true,
        "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "tick": 100,
      }
    `)
  })

  test('behavior: flip bid requires flipTick >= tick', async () => {
    const { base } = await setupPair()

    const { receipt } = await Actions.dex.placeFlipSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      flipTick: Tick.fromPrice('1.001'),
      tick: Tick.fromPrice('1.0005'),
      token: base,
      type: 'buy',
    } as never)
    expect(receipt.status).toBe('success')

    const { receipt: receipt2 } = await Actions.dex.placeFlipSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      flipTick: Tick.fromPrice('1.001'),
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)
    expect(receipt2.status).toBe('success')

    await expect(
      Actions.dex.placeFlipSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        flipTick: Tick.fromPrice('1.0005'),
        tick: Tick.fromPrice('1.001'),
        token: base,
        type: 'buy',
      } as never),
    ).rejects.toThrow('error InvalidFlipTick()')
  })

  test('behavior: flip ask requires flipTick <= tick', async () => {
    const { base } = await setupPair()

    const { receipt } = await Actions.dex.placeFlipSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      flipTick: Tick.fromPrice('1.0005'),
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'sell',
    } as never)
    expect(receipt.status).toBe('success')

    const { receipt: receipt2 } = await Actions.dex.placeFlipSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      flipTick: Tick.fromPrice('1.0005'),
      tick: Tick.fromPrice('1.0005'),
      token: base,
      type: 'sell',
    } as never)
    expect(receipt2.status).toBe('success')

    await expect(
      Actions.dex.placeFlipSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        flipTick: Tick.fromPrice('1.001'),
        tick: Tick.fromPrice('1.0005'),
        token: base,
        type: 'sell',
      } as never),
    ).rejects.toThrow('error InvalidFlipTick()')
  })

  test('behavior: flip ticks at boundaries', async () => {
    const { base } = await setupPair()

    const { receipt } = await Actions.dex.placeFlipSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      flipTick: Tick.maxTick,
      tick: Tick.minTick,
      token: base,
      type: 'buy',
    } as never)
    expect(receipt.status).toBe('success')
  })
})

describe('sell', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    // Bid-side liquidity to sell into.
    await Actions.dex.placeSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('0.999'),
      token: base,
      type: 'buy',
    } as never)

    const { receipt } = await Actions.dex.sellSync(client, {
      amountIn: 100_000_000n,
      feeToken: tempo.alphaUsd,
      minAmountOut: 50_000_000n,
      tokenIn: base,
      tokenOut: quote,
    } as never)
    expect(receipt.status).toBe('success')
  })

  test('behavior: respects minAmountOut', async () => {
    const { base, quote } = await setupPair()

    // Bid priced 1% below peg.
    await Actions.dex.placeSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('0.99'),
      token: base,
      type: 'buy',
    } as never)

    await expect(
      Actions.dex.sellSync(client, {
        amountIn: 100_000_000n,
        feeToken: tempo.alphaUsd,
        minAmountOut: 150_000_000n,
        tokenIn: base,
        tokenOut: quote,
      } as never),
    ).rejects.toThrow('error InsufficientOutput()')
  })

  test('behavior: fails with insufficient liquidity', async () => {
    const { base, quote } = await setupPair()

    await expect(
      Actions.dex.sellSync(client, {
        amountIn: 100_000_000n,
        feeToken: tempo.alphaUsd,
        minAmountOut: 100_000_000n,
        tokenIn: base,
        tokenOut: quote,
      } as never),
    ).rejects.toThrow('error InsufficientLiquidity()')
  })
})

describe('watchFlipOrderPlaced', () => {
  test('default', async () => {
    const { base } = await setupPair()

    const watcher = Actions.dex.watchFlipOrderPlaced(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.dex.placeFlipSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        flipTick: Tick.fromPrice('1.002'),
        tick: Tick.fromPrice('1.001'),
        token: base,
        type: 'buy',
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBe(1)
      const { orderId, token, ...args } = logs[0]!.args
      expect(orderId).toBeGreaterThan(0n)
      expect(token).toBe(base)
      expect(args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "flipTick": 200,
          "isBid": true,
          "isFlipOrder": true,
          "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "tick": 100,
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchOrderCancelled', () => {
  test('default', async () => {
    const { base } = await setupPair()

    const watcher = Actions.dex.watchOrderCancelled(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      const { orderId } = await Actions.dex.placeSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.fromPrice('1.001'),
        token: base,
        type: 'buy',
      } as never)
      await Actions.dex.cancelSync(client, {
        feeToken: tempo.alphaUsd,
        orderId,
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBe(1)
      expect(logs[0]!.args.orderId).toBe(orderId)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by orderId', async () => {
    const { base } = await setupPair()

    const { orderId: orderId1 } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)
    const { orderId: orderId2 } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)

    const watcher = Actions.dex.watchOrderCancelled(client, {
      args: { orderId: orderId1 },
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.dex.cancelSync(client, {
        feeToken: tempo.alphaUsd,
        orderId: orderId1,
      } as never)
      await Actions.dex.cancelSync(client, {
        feeToken: tempo.alphaUsd,
        orderId: orderId2,
      } as never)

      await waitFor(() => logs.length > 0)
      // Grace period to catch any (unexpected) unfiltered logs.
      await new Promise((resolve) => setTimeout(resolve, 300))

      expect(logs.length).toBe(1)
      expect(logs[0]!.args.orderId).toBe(orderId1)
    } finally {
      watcher.off()
    }
  })
})

describe.todo('watchOrderFilled')

describe('watchOrderPlaced', () => {
  test('default', async () => {
    const { base } = await setupPair()

    const watcher = Actions.dex.watchOrderPlaced(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.dex.placeSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.fromPrice('1.001'),
        token: base,
        type: 'buy',
      } as never)
      await Actions.dex.placeSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.fromPrice('0.999'),
        token: base,
        type: 'sell',
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs.length).toBe(2)
      const {
        orderId: firstOrderId,
        token: firstToken,
        ...first
      } = logs[0]!.args
      expect(firstOrderId).toBeGreaterThan(0n)
      expect(firstToken).toBe(base)
      expect(first).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "flipTick": 0,
          "isBid": true,
          "isFlipOrder": false,
          "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "tick": 100,
        }
      `)
      const {
        orderId: secondOrderId,
        token: secondToken,
        ...second
      } = logs[1]!.args
      expect(secondOrderId).toBeGreaterThan(firstOrderId)
      expect(secondToken).toBe(base)
      expect(second).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "flipTick": 0,
          "isBid": false,
          "isFlipOrder": false,
          "maker": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "tick": -100,
        }
      `)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by token', async () => {
    const { base } = await setupPair()
    const { base: base2 } = await setupPair()

    const watcher = Actions.dex.watchOrderPlaced(client, {
      args: { token: base },
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.dex.placeSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.fromPrice('1.001'),
        token: base,
        type: 'buy',
      } as never)
      await Actions.dex.placeSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        tick: Tick.fromPrice('1.001'),
        token: base2,
        type: 'buy',
      } as never)

      await waitFor(() => logs.length > 0)
      // Grace period to catch any (unexpected) unfiltered logs.
      await new Promise((resolve) => setTimeout(resolve, 300))

      expect(logs.length).toBe(1)
      expect(logs[0]!.args.token).toBe(base)
    } finally {
      watcher.off()
    }
  })
})

describe('withdraw', () => {
  test('default', async () => {
    const { base, quote } = await setupPair()

    const { orderId } = await Actions.dex.placeSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      tick: Tick.fromPrice('1.001'),
      token: base,
      type: 'buy',
    } as never)
    await Actions.dex.cancelSync(client, {
      feeToken: tempo.alphaUsd,
      orderId,
    } as never)

    const dexBalance = await Actions.dex.getBalance(client, { token: quote })
    expect(dexBalance).toBeGreaterThan(0n)

    const walletBefore = await Actions.token.getBalance(client, {
      token: quote,
    })

    const { receipt } = await Actions.dex.withdrawSync(client, {
      amount: dexBalance,
      feeToken: tempo.alphaUsd,
      token: quote,
    } as never)
    expect(receipt.status).toBe('success')

    await expect(
      Actions.dex.getBalance(client, { token: quote }),
    ).resolves.toBe(0n)

    const walletAfter = await Actions.token.getBalance(client, {
      token: quote,
    })
    expect(walletAfter.amount).toBe(walletBefore.amount + dexBalance)
  })
})
