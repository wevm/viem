import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

// An empty book reads int16 sentinel ticks from the node.
const emptyBidTick = -32768
const emptyAskTick = 32767

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

describe('getOrderbook', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Book Default')
    expect(
      await Actions.dex.getOrderbook(client, { base, quote }),
    ).toMatchObject({
      base,
      quote,
      bestBidTick: emptyBidTick,
      bestAskTick: emptyAskTick,
    })
  })

  test('behavior: shows best bid and ask after orders placed', async () => {
    const { base, quote } = await setupTokenPair('Book Best')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: -100,
    })
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'sell',
      tick: 100,
    })
    expect(
      await Actions.dex.getOrderbook(client, { base, quote }),
    ).toMatchObject({ bestBidTick: -100, bestAskTick: 100 })
  })

  test('behavior: best ticks update after better orders placed', async () => {
    const { base, quote } = await setupTokenPair('Book Better')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: -100,
    })
    expect(
      (await Actions.dex.getOrderbook(client, { base, quote })).bestBidTick,
    ).toBe(-100)
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 0,
    })
    expect(
      (await Actions.dex.getOrderbook(client, { base, quote })).bestBidTick,
    ).toBe(0)
  })

  test.skip('behavior: best ticks update after order cancellation', async () => {})

  test('behavior: multiple pairs have independent orderbooks', async () => {
    const { base: base1, quote: quote1 } = await setupTokenPair('Book Pair One')
    const { base: base2, quote: quote2 } = await setupTokenPair('Book Pair Two')
    await Actions.dex.placeSync(client, {
      token: base1,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    await Actions.dex.placeSync(client, {
      token: base2,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: -100,
    })
    expect(
      (await Actions.dex.getOrderbook(client, { base: base1, quote: quote1 }))
        .bestBidTick,
    ).toBe(100)
    expect(
      (await Actions.dex.getOrderbook(client, { base: base2, quote: quote2 }))
        .bestBidTick,
    ).toBe(-100)
  })
})
