import { describe, expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { localhost, mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { erc20Actions } from './erc20.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const client = createClient({ account, chain: mainnet, transport: http() })

describe('inference', () => {
  const extended = client.extend(erc20Actions())

  test('attaches a single `erc20` namespace', () => {
    expectTypeOf(extended).toHaveProperty('erc20')
    expectTypeOf(extended.erc20.transfer).toBeFunction()
    expectTypeOf(extended.erc20.getBalance).toBeFunction()
    expectTypeOf(extended.erc20.getTotalSupply).toBeFunction()
  })
})

describe('token selector', () => {
  const extended = client.extend(erc20Actions())

  test('selects by `token` name', () => {
    extended.erc20.transfer({ token: 'usdc', to: '0x', amount: '10.5' })
    extended.erc20.approve({ token: 'usdc', spender: '0x', amount: '10.5' })
    extended.erc20.getBalance({ token: 'usdc', account: '0x' })
    extended.erc20.getTotalSupply({ token: 'usdc' })
  })

  test('selects by `token` address', () => {
    extended.erc20.transfer({ token: '0x', to: '0x', amount: '1' })
    extended.erc20.getBalance({ token: '0x', account: '0x' })
  })

  test('rejects an unknown `token` name', () => {
    // @ts-expect-error - 'dai' is neither declared on mainnet nor an address
    extended.erc20.transfer({ token: 'dai', to: '0x', amount: '1' })
  })

  test('requires `token`', () => {
    // @ts-expect-error - must provide `token`
    extended.erc20.transfer({ to: '0x', amount: '1' })
  })

  test('decimals optional for a `token` address (inferred at runtime)', () => {
    extended.erc20.transfer({ token: '0x', to: '0x', amount: '1' })
    extended.erc20.transfer({
      token: '0x',
      decimals: 6,
      to: '0x',
      amount: '1',
    })
  })
})

describe('amount: string only', () => {
  const extended = client.extend(erc20Actions())

  test('accepts a decimal string', () => {
    extended.erc20.transfer({ token: 'usdc', to: '0x', amount: '10.5' })
    extended.erc20.transfer({
      token: 'usdc',
      from: '0x',
      to: '0x',
      amount: '1',
    })
  })

  test('rejects a bigint amount', () => {
    // @ts-expect-error - amount must be a string
    extended.erc20.transfer({ token: 'usdc', to: '0x', amount: 1n })
  })
})

describe('read actions', () => {
  const extended = client.extend(erc20Actions())

  test('getBalance returns base units + formatted', async () => {
    const balance = await extended.erc20.getBalance({
      token: 'usdc',
      account: '0x',
    })
    expectTypeOf(balance).toEqualTypeOf<{
      amount: bigint
      decimals: number
      formatted: string
    }>()
  })

  test('getTotalSupply returns base units + formatted', async () => {
    const totalSupply = await extended.erc20.getTotalSupply({ token: 'usdc' })
    expectTypeOf(totalSupply).toEqualTypeOf<{
      amount: bigint
      decimals: number
      formatted: string
    }>()
  })
})

describe('write actions', () => {
  const extended = client.extend(erc20Actions())

  test('.call, .estimateGas, .simulate, .extractEvent', () => {
    expectTypeOf(extended.erc20.transfer.call).toBeFunction()
    expectTypeOf(extended.erc20.transfer.estimateGas).toBeFunction()
    expectTypeOf(extended.erc20.transfer.simulate).toBeFunction()
    expectTypeOf(extended.erc20.transfer.extractEvent).toBeFunction()
    expectTypeOf(extended.erc20.approve.estimateGas).toBeFunction()
    expectTypeOf(extended.erc20.approve.simulate).toBeFunction()
  })

  test('transferSync returns a receipt', async () => {
    const result = await extended.erc20.transferSync({
      token: 'usdc',
      to: '0x',
      amount: '1',
    })
    expectTypeOf(result.receipt).toEqualTypeOf<TransactionReceipt>()
  })
})

describe('chain without tokens', () => {
  // `localhost` declares no `tokens`, so only an address `token` is allowed.
  const extended = createClient({
    account,
    chain: localhost,
    transport: http(),
  }).extend(erc20Actions())

  test('the `erc20` namespace still exists', () => {
    expectTypeOf(extended.erc20.transfer).toBeFunction()
  })

  test('`token` must be an address; `decimals` is optional (defaults to 0)', () => {
    extended.erc20.transfer({
      token: '0x',
      decimals: 6,
      to: '0x',
      amount: '1',
    })
    extended.erc20.transfer({ token: '0x', to: '0x', amount: '1' })
    // @ts-expect-error - `token` is required when the chain has no `tokens`
    extended.erc20.transfer({ to: '0x', amount: '1' })
  })
})

describe('client without a chain', () => {
  const extended = createClient({ account, transport: http() }).extend(
    erc20Actions(),
  )

  test('the `erc20` namespace still exists', () => {
    expectTypeOf(extended.erc20.transfer).toBeFunction()
  })
})
