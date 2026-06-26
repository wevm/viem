import { describe, expect, test } from 'vitest'
import { client, holder, usdc } from '~test/erc20.js'
import { formatUnits } from '../../utils/unit/formatUnits.js'
import { getBalance } from './getBalance.js'

describe('getBalance', () => {
  test('default', async () => {
    const balance = await getBalance(client, {
      token: usdc,
      account: holder,
    })
    // `balance.amount` is a live mainnet-fork value, so we assert on its
    // type/range and that `formatted` is derived from it.
    expect(typeof balance.amount).toBe('bigint')
    expect(balance.amount).toBeGreaterThan(0n)
    expect(balance.formatted).toBe(formatUnits(balance.amount, 6))
  })

  test('decimals: formats with an explicit decimals', async () => {
    const balance = await getBalance(client, {
      token: usdc,
      account: holder,
      decimals: 2,
    })
    expect(balance.formatted).toBe(formatUnits(balance.amount, 2))
  })

  test('decimals: defaults to 0 for an undeclared token', async () => {
    // DAI is not declared on the chain's `tokens` config and no `decimals` is
    // passed, so `decimals` defaults to 0 — `formatted` equals the raw amount.
    const balance = await getBalance(client, {
      token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      account: holder,
    })
    expect(balance.formatted).toBe(balance.amount.toString())
    expect(balance.formatted).toBe(formatUnits(balance.amount, 0))
  })

  test('call', () => {
    const call = getBalance.call(client, { token: usdc, account: holder })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0x70a082310000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c078",
        "functionName": "balanceOf",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('token: resolves balance from chain tokens', async () => {
    const balance = await getBalance(client, { token: 'usdc', account: holder })
    // `balance.amount` is a live mainnet-fork value, so we assert on its
    // type/range and that `formatted` is derived from it.
    expect(typeof balance.amount).toBe('bigint')
    expect(balance.amount).toBeGreaterThan(0n)
    expect(balance.formatted).toBe(formatUnits(balance.amount, 6))
  })

  test('token: call resolves address from chain tokens', () => {
    const call = getBalance.call(client, { token: 'usdc', account: holder })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0x70a082310000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c078",
        "functionName": "balanceOf",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })
})
