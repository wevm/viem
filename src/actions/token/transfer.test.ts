import { beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  client,
  decimals,
  holder,
  prepareAccount,
  usdc,
} from '~test/token.js'
import { getTransactionReceipt } from '../public/getTransactionReceipt.js'
import { mine } from '../test/mine.js'
import { approve } from './approve.js'
import { getBalance } from './getBalance.js'
import { transfer } from './transfer.js'

const spender = accounts[4].address
const to = accounts[5].address

beforeAll(async () => {
  await prepareAccount(holder)
  await prepareAccount(spender)
})

describe('transfer', () => {
  test('default', async () => {
    const before = await getBalance(client, { token: usdc, account: to })

    const hash = await transfer(client, {
      account: holder,
      token: usdc,
      to,
      amount: 1000000000n,
    })
    await mine(client, { blocks: 1 })

    const receipt = await getTransactionReceipt(client, { hash })
    const { args } = transfer.extractEvent(receipt.logs)
    expect(args).toMatchInlineSnapshot(`
      {
        "from": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "to": "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        "value": 1000000000n,
      }
    `)

    const after = await getBalance(client, { token: usdc, account: to })
    expect(after.amount - before.amount).toMatchInlineSnapshot(`1000000000n`)
  })

  test('call: uses a base unit amount', () => {
    const call = transfer.call(client, { token: usdc, to, amount: 1n })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0xa9059cbb0000000000000000000000009965507d1a55bcc2695c58ba16fb37d819b0a4dc0000000000000000000000000000000000000000000000000000000000000001",
        "functionName": "transfer",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('call: requires decimals for a formatted undeclared token amount', () => {
    expect(() =>
      transfer.call(client, {
        token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        to,
        amount: { formatted: '1' },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('decimals: requires decimals for an undeclared formatted amount', async () => {
    const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const recipient = accounts[6].address

    await expect(
      transfer(client, {
        account: holder,
        token: dai,
        to: recipient,
        amount: { formatted: '0.000000000000000001' },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('token: resolves address + decimals from client tokens', async () => {
    const tokenTo = accounts[8].address
    const before = await getBalance(client, { token: 'usdc', account: tokenTo })

    const hash = await transfer(client, {
      account: holder,
      token: 'usdc',
      to: tokenTo,
      amount: { formatted: '1000' },
    })
    await mine(client, { blocks: 1 })

    const receipt = await getTransactionReceipt(client, { hash })
    const { args } = transfer.extractEvent(receipt.logs)
    expect(args).toMatchInlineSnapshot(`
      {
        "from": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "to": "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
        "value": 1000000000n,
      }
    `)

    const after = await getBalance(client, { token: 'usdc', account: tokenTo })
    expect(after.amount - before.amount).toMatchInlineSnapshot(`1000000000n`)
  })

  test('token: call resolves address + decimals from client tokens', () => {
    const call = transfer.call(client, {
      token: 'usdc',
      to,
      amount: { formatted: '1' },
    })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0xa9059cbb0000000000000000000000009965507d1a55bcc2695c58ba16fb37d819b0a4dc00000000000000000000000000000000000000000000000000000000000f4240",
        "functionName": "transfer",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('call: switches to transferFrom', () => {
    const call = transfer.call(client, {
      token: usdc,
      from: holder,
      to,
      amount: { decimals, formatted: '1' },
    })
    expect({
      data: call.data,
      functionName: call.functionName,
      to: call.to,
    }).toMatchInlineSnapshot(`
      {
        "data": "0x23b872dd0000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c0780000000000000000000000009965507d1a55bcc2695c58ba16fb37d819b0a4dc00000000000000000000000000000000000000000000000000000000000f4240",
        "functionName": "transferFrom",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('extractEvent: throws when missing', () => {
    expect(() => transfer.extractEvent([])).toThrowErrorMatchingInlineSnapshot(
      `[Error: \`Transfer\` event not found.]`,
    )
  })

  test('estimateGas: infers decimals from client tokens', async () => {
    const gas = await transfer.estimateGas(client, {
      account: holder,
      token: usdc,
      amount: 1n,
      to,
    })
    expect(gas).toBeTypeOf('bigint')
    expect(gas).toBeGreaterThan(0n)
  })

  test('simulate: infers decimals from client tokens', async () => {
    const { result, request } = await transfer.simulate(client, {
      account: holder,
      token: usdc,
      amount: 1n,
      to,
    })
    expect(result).toBe(true)
    expect(request.functionName).toBe('transfer')
  })
})

describe('transfer: from (allowance)', () => {
  test('default', async () => {
    // Holder approves spender to move tokens.
    await approve(client, {
      account: holder,
      token: usdc,
      spender,
      amount: { decimals, formatted: '2000' },
    })
    await mine(client, { blocks: 1 })

    const before = await getBalance(client, { token: usdc, account: to })

    const hash = await transfer(client, {
      account: spender,
      token: usdc,
      from: holder,
      to,
      amount: { decimals, formatted: '2000' },
    })
    await mine(client, { blocks: 1 })

    const receipt = await getTransactionReceipt(client, { hash })
    const { args } = transfer.extractEvent(receipt.logs)
    expect(args).toMatchInlineSnapshot(`
      {
        "from": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "to": "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        "value": 2000000000n,
      }
    `)

    const after = await getBalance(client, { token: usdc, account: to })
    expect(after.amount - before.amount).toMatchInlineSnapshot(`2000000000n`)
  })
})
