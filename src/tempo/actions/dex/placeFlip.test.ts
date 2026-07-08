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

describe('placeFlip', () => {
  test('default', async () => {
    const { base } = await setupTokenPair('Flip Default')
    const { receipt, orderId, token, ...result } =
      await Actions.dex.placeFlipSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'buy',
        tick: 100,
        flipTick: 200,
      })
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
    const { base } = await setupTokenPair('Flip Bid')
    expect(
      (
        await Actions.dex.placeFlipSync(client, {
          token: base,
          amount: Value.from('100', 6),
          type: 'buy',
          tick: 50,
          flipTick: 100,
        })
      ).receipt.status,
    ).toBe('success')
    expect(
      (
        await Actions.dex.placeFlipSync(client, {
          token: base,
          amount: Value.from('100', 6),
          type: 'buy',
          tick: 100,
          flipTick: 100,
        })
      ).receipt.status,
    ).toBe('success')
    await expect(
      Actions.dex.placeFlipSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'buy',
        tick: 100,
        flipTick: 50,
      }),
    ).rejects.toThrow('The contract function "placeFlip" reverted')
  })

  test('behavior: flip ask requires flipTick <= tick', async () => {
    const { base } = await setupTokenPair('Flip Ask')
    expect(
      (
        await Actions.dex.placeFlipSync(client, {
          token: base,
          amount: Value.from('100', 6),
          type: 'sell',
          tick: 100,
          flipTick: 50,
        })
      ).receipt.status,
    ).toBe('success')
    expect(
      (
        await Actions.dex.placeFlipSync(client, {
          token: base,
          amount: Value.from('100', 6),
          type: 'sell',
          tick: 50,
          flipTick: 50,
        })
      ).receipt.status,
    ).toBe('success')
    await expect(
      Actions.dex.placeFlipSync(client, {
        token: base,
        amount: Value.from('100', 6),
        type: 'sell',
        tick: 50,
        flipTick: 100,
      }),
    ).rejects.toThrow('The contract function "placeFlip" reverted')
  })

  test('behavior: flip ticks at boundaries', async () => {
    const { base } = await setupTokenPair('Flip Bounds')
    expect(
      (
        await Actions.dex.placeFlipSync(client, {
          token: base,
          amount: Value.from('100', 6),
          type: 'buy',
          tick: minTick,
          flipTick: maxTick,
        })
      ).receipt.status,
    ).toBe('success')
  })
})
