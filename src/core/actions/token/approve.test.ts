import { beforeAll, describe, expect, test } from 'vitest'

import { Actions } from 'viem'

import {
  accounts,
  client,
  decimals,
  holder,
  prepareAccount,
  usdc,
} from '~test/token.js'
import { approve } from './approve.js'
import { getAllowance } from './getAllowance.js'

const spender = accounts[2].address

beforeAll(async () => {
  await prepareAccount(holder)
})

describe('approve', () => {
  test('default', async () => {
    const hash = await approve(client, {
      account: holder,
      token: usdc,
      spender,
      amount: 100000000n,
    })
    await Actions.block.mine(client, { blocks: 1 })

    const receipt = await Actions.transaction.getReceipt(client, { hash })
    const { args } = approve.extractEvent(receipt.logs)
    expect(args).toMatchInlineSnapshot(`
      {
        "owner": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "spender": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "value": 100000000n,
      }
    `)

    const result = await getAllowance(client, {
      token: usdc,
      account: holder,
      spender,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "decimals": 6,
        "formatted": "100",
      }
    `)
  })

  test('call: parses formatted amount with explicit decimals', () => {
    // `1.5` at 6 decimals == `1500000` base units.
    const call = approve.call(client, {
      token: usdc,
      spender,
      amount: { decimals, formatted: '1.5' },
    })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0x095ea7b30000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc000000000000000000000000000000000000000000000000000000000016e360",
        "functionName": "approve",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('call: uses a base unit amount', () => {
    const call = approve.call(client, { token: usdc, spender, amount: 1n })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0x095ea7b30000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc0000000000000000000000000000000000000000000000000000000000000001",
        "functionName": "approve",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('call: requires decimals for a formatted undeclared token amount', () => {
    expect(() =>
      approve.call(client, {
        token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        spender,
        amount: { formatted: '1' },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('decimals: requires decimals for an undeclared formatted amount', async () => {
    const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    await expect(
      approve(client, {
        account: holder,
        token: dai,
        spender,
        amount: { formatted: '1' },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('token: resolves address + decimals from client tokens', async () => {
    const tokenSpender = accounts[1].address
    const hash = await approve(client, {
      account: holder,
      token: 'usdc',
      spender: tokenSpender,
      amount: { formatted: '100' },
    })
    await Actions.block.mine(client, { blocks: 1 })

    const receipt = await Actions.transaction.getReceipt(client, { hash })
    const { args } = approve.extractEvent(receipt.logs)
    expect(args).toMatchInlineSnapshot(`
      {
        "owner": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "value": 100000000n,
      }
    `)

    const result = await getAllowance(client, {
      token: 'usdc',
      account: holder,
      spender: tokenSpender,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "decimals": 6,
        "formatted": "100",
      }
    `)
  })

  test('token: call resolves address + decimals from client tokens', () => {
    const call = approve.call(client, {
      token: 'usdc',
      spender,
      amount: { formatted: '1' },
    })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0x095ea7b30000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc00000000000000000000000000000000000000000000000000000000000f4240",
        "functionName": "approve",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('extractEvent: throws when missing', () => {
    expect(() => approve.extractEvent([])).toThrowErrorMatchingInlineSnapshot(
      `[Error: \`Approval\` event not found.]`,
    )
  })

  test('estimateGas: infers decimals from client tokens', async () => {
    const gas = await approve.estimateGas(client, {
      account: holder,
      token: usdc,
      amount: 1n,
      spender,
    })
    expect(gas).toBeTypeOf('bigint')
    expect(gas).toBeGreaterThan(0n)
  })

  test('simulate: infers decimals from client tokens', async () => {
    const { result, request } = await approve.simulate(client, {
      account: holder,
      token: usdc,
      amount: 1n,
      spender,
    })
    expect(result).toBe(true)
    expect(request.functionName).toBe('approve')
  })
})
