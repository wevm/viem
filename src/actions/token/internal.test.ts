import { describe, expect, test } from 'vitest'
import { client, usdc } from '~test/token.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { pickWriteParameters, resolveToken } from './internal.js'

// DAI: a token that is not declared on the mainnet chain's `tokens` config.
const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

describe('resolveToken', () => {
  test('resolves `address` and `decimals` from a `token` name', () => {
    expect(resolveToken(client, { token: 'usdc' })).toMatchInlineSnapshot(`
      {
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "decimals": 6,
      }
    `)
  })

  test('explicit `decimals` overrides the token decimals', () => {
    expect(
      resolveToken(client, { token: 'usdc', decimals: 8 }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "decimals": 8,
      }
    `)
  })

  test('infers `decimals` from a declared `token` address', () => {
    expect(resolveToken(client, { token: usdc })).toMatchInlineSnapshot(`
      {
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "decimals": 6,
      }
    `)
  })

  test('passes through an `address` with explicit `decimals`', () => {
    expect(
      resolveToken(client, { token: dai, decimals: 18 }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "decimals": 18,
      }
    `)
  })

  test('defaults `decimals` to 0 for an undeclared `address`', () => {
    expect(resolveToken(client, { token: dai })).toMatchInlineSnapshot(`
      {
        "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "decimals": 0,
      }
    `)
  })

  test('throws when the `token` name is not declared and is not an address', () => {
    expect(() =>
      resolveToken(client, { token: 'dai' }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token "dai" is not a declared ERC-20 token on the chain's \`tokens\` config, and is not a valid address.]`,
    )
  })

  test('resolves an `address` when the chain has no tokens', () => {
    const chainless = createClient({ transport: http('https://eth.merkle.io') })
    expect(resolveToken(chainless, { token: usdc })).toMatchInlineSnapshot(`
      {
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "decimals": 0,
      }
    `)
  })

  test('throws for a `token` name when the chain has no tokens', () => {
    const chainless = createClient({ transport: http('https://eth.merkle.io') })
    expect(() =>
      resolveToken(chainless, { token: 'usdc' }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token "usdc" is not a declared ERC-20 token on the chain's \`tokens\` config, and is not a valid address.]`,
    )
  })
})

describe('pickWriteParameters', () => {
  test('keeps transaction overrides, drops action args', () => {
    expect(
      pickWriteParameters({
        account: '0x',
        amount: '1',
        gas: 21000n,
        nonce: 5,
        to: '0x',
        token: usdc,
      }),
    ).toMatchInlineSnapshot(`
      {
        "account": "0x",
        "chain": undefined,
        "gas": 21000n,
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": undefined,
        "nonce": 5,
      }
    `)
  })
})
