import { Hex, Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Client, custom } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

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

  test('behavior: json-rpc account: call args stay out of the request', async () => {
    const hash =
      '0x083f102bb0e0aeca27ea5c442df0bb0f36d09e3f5cf99363cef8d70a17e91039'
    let request: unknown
    const client = Client.create({
      chain: tempoLocalnet,
      transport: custom({
        async request({ method, params }) {
          if (method === 'eth_chainId') return Hex.fromNumber(tempoLocalnet.id)
          if (method === 'eth_sendTransaction') {
            request = params[0]
            return hash
          }
          throw new Error(`unexpected method: ${method}`)
        },
      }),
    })
    expect(
      await Actions.dex.placeFlip(client, {
        account: tempo.accounts[0]!.address,
        amount: Value.from('100', 6),
        flipTick: 200,
        tick: 100,
        token: tempo.pathUsd,
        type: 'buy',
      }),
    ).toBe(hash)
    expect(request).toMatchInlineSnapshot(`
      {
        "chainId": "0x539",
        "data": "0x922828f100000000000000000000000020c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005f5e1000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8",
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "input": "0x922828f100000000000000000000000020c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005f5e1000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8",
        "to": "0xdec0000000000000000000000000000000000000",
      }
    `)
  })
})
