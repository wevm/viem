import { describe, expect, test } from 'vitest'
import { client, usdc } from '~test/token.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import {
  pickWriteParameters,
  resolveAmountDecimals,
  resolveToken,
  toBaseUnits,
} from './internal.js'

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

  test('resolves mixed-case `token` names against lowercase chain tokens', () => {
    expect(resolveToken(client, { token: 'USDC' })).toMatchInlineSnapshot(`
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

  test('leaves `decimals` undefined for an undeclared `address`', () => {
    expect(resolveToken(client, { token: dai })).toMatchInlineSnapshot(`
      {
        "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "decimals": undefined,
      }
    `)
  })

  test('throws when the `token` name is not declared and is not an address', () => {
    expect(() =>
      resolveToken(client, { token: 'dai' }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token "dai" is not a declared ERC-20 token on the client's \`tokens\` config (with an address for the client's chain), and is not a valid address.]`,
    )
  })

  test('resolves an `address` when the chain has no tokens', () => {
    const chainless = createClient({ transport: http('https://eth.merkle.io') })
    expect(resolveToken(chainless, { token: usdc })).toMatchInlineSnapshot(`
      {
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "decimals": undefined,
      }
    `)
  })

  test('throws for a `token` name when the chain has no tokens', () => {
    const chainless = createClient({ transport: http('https://eth.merkle.io') })
    expect(() =>
      resolveToken(chainless, { token: 'usdc' }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token "usdc" is not a declared ERC-20 token on the client's \`tokens\` config (with an address for the client's chain), and is not a valid address.]`,
    )
  })
})

describe('toBaseUnits', () => {
  test('uses base units directly', () => {
    expect(toBaseUnits(123n, 6)).toBe(123n)
  })

  test('uses nested decimals for formatted amounts', () => {
    expect(toBaseUnits({ decimals: 6, formatted: '1.5' }, 0)).toBe(1500000n)
  })

  test('throws for formatted amounts without decimals', () => {
    expect(() =>
      toBaseUnits({ formatted: '1.5' }, undefined),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or declare the token on the chain.]`,
    )
  })
})

describe('resolveAmountDecimals', () => {
  test('uses token decimals for base-unit amounts', () => {
    expect(resolveAmountDecimals(1n, 6)).toBe(6)
  })

  test('uses nested decimals for formatted amounts', () => {
    expect(resolveAmountDecimals({ decimals: 18, formatted: '1' }, 6)).toBe(18)
  })
})

describe('pickWriteParameters', () => {
  test('keeps transaction overrides, drops action args', () => {
    expect(
      pickWriteParameters({
        account: '0x',
        amount: { formatted: '1' },
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
