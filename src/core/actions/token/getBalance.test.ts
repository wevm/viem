import { Value } from 'ox'
import { describe, expect, test } from 'vitest'

import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { usdc as usdcToken } from 'viem/tokens'

import * as anvil from '~test/anvil.js'
import { client, holder, usdc } from '~test/token.js'
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
    expect(balance.formatted).toBe(Value.format(balance.amount, 6))
  })

  test('account: defaults to client account', async () => {
    const clientWithAccount = Client.create({
      account: Account.from(holder),
      chain: mainnet,
      tokens: [usdcToken],
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const [explicit, implicit] = await Promise.all([
      getBalance(client, { token: usdc, account: holder }),
      getBalance(clientWithAccount, { token: usdc }),
    ])

    expect(implicit).toEqual(explicit)
  })

  test('decimals: formats with an explicit decimals', async () => {
    const balance = await getBalance(client, {
      token: usdc,
      account: holder,
      decimals: 2,
    })
    expect(balance.formatted).toBe(Value.format(balance.amount, 2))
  })

  test('decimals: fetches decimals for an undeclared token', async () => {
    const balance = await getBalance(client, {
      token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      account: holder,
    })
    expect(balance.decimals).toBe(18)
    expect(balance.formatted).toBe(Value.format(balance.amount, 18))
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

  test('token: resolves balance from client tokens', async () => {
    const balance = await getBalance(client, { token: 'usdc', account: holder })
    // `balance.amount` is a live mainnet-fork value, so we assert on its
    // type/range and that `formatted` is derived from it.
    expect(typeof balance.amount).toBe('bigint')
    expect(balance.amount).toBeGreaterThan(0n)
    expect(balance.formatted).toBe(Value.format(balance.amount, 6))
  })

  test('token: call resolves address from client tokens', () => {
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
