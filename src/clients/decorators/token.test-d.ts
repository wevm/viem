import { describe, expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { localhost, mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { tokenActions } from './token.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const client = createClient({ account, chain: mainnet, transport: http() })

describe('inference', () => {
  const extended = client.extend(tokenActions())

  test('attaches a single `token` namespace', () => {
    expectTypeOf(extended).toHaveProperty('token')
    expectTypeOf(extended.token.transfer).toBeFunction()
    expectTypeOf(extended.token.getBalance).toBeFunction()
    expectTypeOf(extended.token.getTotalSupply).toBeFunction()
  })
})

describe('token selector', () => {
  const extended = client.extend(tokenActions())

  test('selects by `token` name', () => {
    extended.token.transfer({ token: 'usdc', to: '0x', amount: '10.5' })
    extended.token.approve({ token: 'usdc', spender: '0x', amount: '10.5' })
    extended.token.getBalance({ token: 'usdc', account: '0x' })
    extended.token.getTotalSupply({ token: 'usdc' })
  })

  test('selects by `token` address', () => {
    extended.token.transfer({ token: '0x', to: '0x', amount: '1' })
    extended.token.getBalance({ token: '0x', account: '0x' })
  })

  test('rejects an unknown `token` name', () => {
    // @ts-expect-error - 'dai' is neither declared on mainnet nor an address
    extended.token.transfer({ token: 'dai', to: '0x', amount: '1' })
  })

  test('requires `token`', () => {
    // @ts-expect-error - must provide `token`
    extended.token.transfer({ to: '0x', amount: '1' })
  })

  test('decimals optional for a `token` address (inferred at runtime)', () => {
    extended.token.transfer({ token: '0x', to: '0x', amount: '1' })
    extended.token.transfer({
      token: '0x',
      decimals: 6,
      to: '0x',
      amount: '1',
    })
  })
})

describe('amount: string only', () => {
  const extended = client.extend(tokenActions())

  test('accepts a decimal string', () => {
    extended.token.transfer({ token: 'usdc', to: '0x', amount: '10.5' })
    extended.token.transfer({
      token: 'usdc',
      from: '0x',
      to: '0x',
      amount: '1',
    })
  })

  test('rejects a bigint amount', () => {
    // @ts-expect-error - amount must be a string
    extended.token.transfer({ token: 'usdc', to: '0x', amount: 1n })
  })
})

describe('read actions', () => {
  const extended = client.extend(tokenActions())

  test('getBalance returns base units + formatted', async () => {
    const balance = await extended.token.getBalance({
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
    const totalSupply = await extended.token.getTotalSupply({ token: 'usdc' })
    expectTypeOf(totalSupply).toEqualTypeOf<{
      amount: bigint
      decimals: number
      formatted: string
    }>()
  })
})

describe('write actions', () => {
  const extended = client.extend(tokenActions())

  test('.call, .estimateGas, .simulate, .extractEvent', () => {
    expectTypeOf(extended.token.transfer.call).toBeFunction()
    expectTypeOf(extended.token.transfer.estimateGas).toBeFunction()
    expectTypeOf(extended.token.transfer.simulate).toBeFunction()
    expectTypeOf(extended.token.transfer.extractEvent).toBeFunction()
    expectTypeOf(extended.token.approve.estimateGas).toBeFunction()
    expectTypeOf(extended.token.approve.simulate).toBeFunction()
  })

  test('transferSync returns a receipt', async () => {
    const result = await extended.token.transferSync({
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
  }).extend(tokenActions())

  test('the `token` namespace still exists', () => {
    expectTypeOf(extended.token.transfer).toBeFunction()
  })

  test('`token` must be an address; `decimals` is optional (defaults to 0)', () => {
    extended.token.transfer({
      token: '0x',
      decimals: 6,
      to: '0x',
      amount: '1',
    })
    extended.token.transfer({ token: '0x', to: '0x', amount: '1' })
    // @ts-expect-error - `token` is required when the chain has no `tokens`
    extended.token.transfer({ to: '0x', amount: '1' })
  })
})

describe('client without a chain', () => {
  const extended = createClient({ account, transport: http() }).extend(
    tokenActions(),
  )

  test('the `token` namespace still exists', () => {
    expectTypeOf(extended.token.transfer).toBeFunction()
  })
})
