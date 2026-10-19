import { describe, expect, test } from 'vitest'
import { accounts, client, holder, usdc } from '~test/token.js'
import { getAllowance } from './getAllowance.js'

const spender = accounts[0].address

describe('getAllowance', () => {
  test('default', async () => {
    const result = await getAllowance(client, {
      token: usdc,
      account: holder,
      spender,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 0n,
        "decimals": 6,
        "formatted": "0",
      }
    `)
  })

  test('call', () => {
    const call = getAllowance.call(client, {
      token: usdc,
      account: holder,
      spender,
    })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0xdd62ed3e0000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c078000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "functionName": "allowance",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('token: resolves address from client tokens', async () => {
    const result = await getAllowance(client, {
      token: 'usdc',
      account: holder,
      spender,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 0n,
        "decimals": 6,
        "formatted": "0",
      }
    `)
  })

  test('token: call resolves address from client tokens', () => {
    const call = getAllowance.call(client, {
      token: 'usdc',
      account: holder,
      spender,
    })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0xdd62ed3e0000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c078000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "functionName": "allowance",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })
})
