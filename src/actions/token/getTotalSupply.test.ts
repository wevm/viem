import { describe, expect, test } from 'vitest'
import { client, usdc } from '~test/token.js'
import { formatUnits } from '../../utils/unit/formatUnits.js'
import { getTotalSupply } from './getTotalSupply.js'

describe('getTotalSupply', () => {
  test('default', async () => {
    const totalSupply = await getTotalSupply(client, { token: usdc })
    // `totalSupply.amount` is a live mainnet-fork value.
    expect(typeof totalSupply.amount).toBe('bigint')
    expect(totalSupply.amount).toBeGreaterThan(0n)
    expect(totalSupply.formatted).toBe(formatUnits(totalSupply.amount, 6))
  })

  test('call', () => {
    const call = getTotalSupply.call(client, { token: usdc })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0x18160ddd",
        "functionName": "totalSupply",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('token: resolves total supply from chain tokens', async () => {
    const totalSupply = await getTotalSupply(client, { token: 'usdc' })
    // `totalSupply.amount` is a live mainnet-fork value.
    expect(typeof totalSupply.amount).toBe('bigint')
    expect(totalSupply.amount).toBeGreaterThan(0n)
    expect(totalSupply.formatted).toBe(formatUnits(totalSupply.amount, 6))
  })

  test('token: call resolves address from chain tokens', () => {
    const call = getTotalSupply.call(client, { token: 'usdc' })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0x18160ddd",
        "functionName": "totalSupply",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })
})
