import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts, address } from '~test/constants.js'
import { impersonateAccount } from '../../actions/test/impersonateAccount.js'
import { mine } from '../../actions/test/mine.js'
import { setBalance } from '../../actions/test/setBalance.js'
import { mainnet } from '../../chains/definitions/mainnet.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { formatUnits } from '../../utils/unit/formatUnits.js'
import { wait } from '../../utils/wait.js'
import { tokenActions } from './token.js'

const client = anvilMainnet.getClient().extend(tokenActions())

const usdc = mainnet.tokens.usdc.address
const holder = address.usdcHolder
const to = accounts[1].address

/** Mines blocks until a `*Sync` action resolves (anvil runs with `noMining`). */
async function mined<value>(action: Promise<value>): Promise<value> {
  let settled = false
  const result = action.finally(() => {
    settled = true
  })
  while (!settled) {
    await mine(client, { blocks: 1 })
    await wait(100)
  }
  return result
}

describe('inference', () => {
  test('attaches a single `token` namespace', () => {
    expect(typeof client.token.transfer).toBe('function')
    expect(typeof client.token.getBalance).toBe('function')
    expect(typeof client.token.getTotalSupply).toBe('function')
  })
})

describe('token selector', () => {
  test('resolves address + decimals from a `token` name', () => {
    const call = client.token.transfer.call({
      token: 'usdc',
      to,
      amount: '10.5',
    })
    expect({ data: call.data, to: call.to }).toMatchInlineSnapshot(`
      {
        "data": "0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000a037a0",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('resolves address + decimals from a `token` address', () => {
    const call = client.token.transfer.call({
      token: usdc,
      to,
      amount: '10.5',
    })
    expect({ data: call.data, to: call.to }).toMatchInlineSnapshot(`
      {
        "data": "0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000a037a0",
        "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      }
    `)
  })

  test('accepts a `token` address + explicit `decimals`', () => {
    const call = client.token.transfer.call({
      token: usdc,
      decimals: 6,
      to,
      amount: '10.5',
    })
    expect(getAddress(call.to)).toBe(usdc)
  })

  test('throws for an unknown `token` name', () => {
    expect(() =>
      // @ts-expect-error - 'dai' is not declared on mainnet
      client.token.transfer.call({ token: 'dai', to, amount: '1' }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token "dai" is not a declared ERC-20 token on the chain's \`tokens\` config, and is not a valid address.]`,
    )
  })

  test('defaults decimals to 0 when it cannot be inferred from `token` address', () => {
    // `amount: '1'` parsed with the default 0 decimals == `1n` base units.
    const call = client.token.transfer.call({
      token: '0x0000000000000000000000000000000000000abc',
      to,
      amount: '1',
    })
    expect(getAddress(call.to)).toBe(
      getAddress('0x0000000000000000000000000000000000000abc'),
    )
    expect(call.data.endsWith('1')).toBe(true)
  })
})

describe('getBalance', () => {
  test('default: by token name', async () => {
    const balance = await client.token.getBalance({
      token: 'usdc',
      account: holder,
    })
    expect(balance.amount).toBeTypeOf('bigint')
    expect(balance.formatted).toBe(formatUnits(balance.amount, 6))
  })

  test('by token address', async () => {
    const balance = await client.token.getBalance({
      token: usdc,
      account: holder,
    })
    expect(balance.amount).toBeTypeOf('bigint')
    expect(balance.formatted).toBe(formatUnits(balance.amount, 6))
  })
})

describe('getTotalSupply', () => {
  test('default: by token name', async () => {
    const totalSupply = await client.token.getTotalSupply({ token: 'usdc' })
    expect(totalSupply.amount).toBeTypeOf('bigint')
    expect(totalSupply.amount).toBeGreaterThan(0n)
    expect(totalSupply.formatted).toBe(formatUnits(totalSupply.amount, 6))
  })
})

describe('transferSync', () => {
  test('default: transfers and returns receipt + event', async () => {
    await impersonateAccount(client, { address: holder })
    await setBalance(client, { address: holder, value: 10n ** 20n })

    const before = await client.token.getBalance({ token: 'usdc', account: to })
    const { receipt, value } = await mined(
      client.token.transferSync({
        account: holder,
        token: 'usdc',
        to,
        amount: '100',
      }),
    )

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(value).toMatchInlineSnapshot(`100000000n`)
    const after = await client.token.getBalance({ token: 'usdc', account: to })
    expect(after.amount - before.amount).toMatchInlineSnapshot(`100000000n`)
  })
})

describe('call composition', () => {
  test('.extractEvent present on write actions', () => {
    expect(typeof client.token.transfer.extractEvent).toBe('function')
    expect(typeof client.token.approve.extractEvent).toBe('function')
  })

  test('.estimateGas resolves token from chain', async () => {
    await impersonateAccount(client, { address: holder })
    await setBalance(client, { address: holder, value: 10n ** 20n })
    const gas = await client.token.transfer.estimateGas({
      account: holder,
      amount: '1',
      to,
      token: 'usdc',
    })
    expect(gas).toBeTypeOf('bigint')
    expect(gas).toBeGreaterThan(0n)
  })

  test('.simulate resolves token from chain', async () => {
    await impersonateAccount(client, { address: holder })
    await setBalance(client, { address: holder, value: 10n ** 20n })
    const { result, request } = await client.token.transfer.simulate({
      account: holder,
      amount: '1',
      to,
      token: 'usdc',
    })
    expect(result).toBe(true)
    expect(request.functionName).toBe('transfer')
  })
})
