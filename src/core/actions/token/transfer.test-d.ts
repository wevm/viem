import type { Address, Hex, Log } from 'ox'
import { describe, expectTypeOf, test } from 'vitest'

import { Account, Client, http } from 'viem'
import { mainnet, zora } from 'viem/chains'
import { usdc } from 'viem/tokens'

import type { getCallsStatus } from '../wallet/getCallsStatus.js'
import { transfer } from './transfer.js'
import { transferSync } from './transferSync.js'

const account = Account.fromPrivateKey(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

describe('transfer: token selector', () => {
  const client = Client.create({
    account,
    chain: mainnet,
    tokens: [usdc],
    transport: http(),
  })

  test('selects by `token` symbol', () => {
    transfer(client, { amount: 1n, to: '0x', token: 'usdc' })
    transfer(client, {
      amount: { formatted: '1' },
      to: '0x',
      token: 'usdc',
    })
  })

  test('selects by `token` address', () => {
    transfer(client, { amount: { formatted: '1' }, to: '0x', token: '0x' })
    transfer(client, {
      amount: { decimals: 6, formatted: '1' },
      to: '0x',
      token: '0x',
    })
  })

  test('rejects an unknown `token` symbol', () => {
    // @ts-expect-error - 'dai' is neither declared on the client nor an address
    transfer(client, { amount: { formatted: '1' }, to: '0x', token: 'dai' })
  })

  test('rejects a bare string amount', () => {
    // @ts-expect-error - use base units or a formatted helper
    transfer(client, { amount: '1', to: '0x', token: 'usdc' })
  })

  test('rejects top-level `decimals`', () => {
    transfer(client, {
      // @ts-expect-error - pass decimals under `amount` for formatted amounts
      decimals: 6,
      amount: { formatted: '1' },
      to: '0x',
      token: 'usdc',
    })
  })

  test('requires `token`', () => {
    // @ts-expect-error - must provide `token`
    transfer(client, { amount: { formatted: '1' }, to: '0x' })
  })

  test('client without tokens: only an address `token` is allowed', () => {
    const client = Client.create({ account, chain: zora, transport: http() })
    transfer(client, { amount: { formatted: '1' }, to: '0x', token: '0x' })
    transfer(client, {
      amount: { decimals: 18, formatted: '1' },
      to: '0x',
      token: '0x',
    })
    // @ts-expect-error - the client declares no `tokens`, so symbols are unavailable
    transfer(client, { amount: { formatted: '1' }, to: '0x', token: 'usdc' })
  })
})

describe('transfer.extractEvent: log shape', () => {
  test('accepts EIP-5792 call receipt logs', () => {
    const logs: getCallsStatus.ReturnType['receipts'][number]['logs'] = []
    const log = transfer.extractEvent(logs)

    expectTypeOf(log.eventName).toEqualTypeOf<'Transfer'>()
    expectTypeOf(log.args).toEqualTypeOf<{
      from: Address.Address
      to: Address.Address
      value: bigint
    }>()
  })

  test('does not invent metadata the input never carried', () => {
    const logs: getCallsStatus.ReturnType['receipts'][number]['logs'] = []
    const log = transfer.extractEvent(logs)

    expectTypeOf(log).not.toHaveProperty('blockNumber')
    expectTypeOf(log).not.toHaveProperty('transactionHash')
    expectTypeOf(log.address).toEqualTypeOf<Address.Address>()
    expectTypeOf(log.data).toEqualTypeOf<Hex.Hex>()
  })

  test('preserves metadata for full logs', () => {
    const logs: readonly Log.Log[] = []
    const log = transfer.extractEvent(logs)

    expectTypeOf(log.blockNumber).toEqualTypeOf<bigint>()
    expectTypeOf(log.transactionHash).toEqualTypeOf<Hex.Hex>()
  })

  test('rejects logs without topics', () => {
    // @ts-expect-error - `topics` is the one field decoding cannot do without
    transfer.extractEvent([{ address: '0x', data: '0x' }])
  })
})

describe('transferSync: token selector', () => {
  test('client with tokens: selects by `token` symbol or address', () => {
    const client = Client.create({
      account,
      chain: mainnet,
      tokens: [usdc],
      transport: http(),
    })
    transferSync(client, { amount: 1n, to: '0x', token: 'usdc' })
    transferSync(client, {
      amount: { formatted: '1' },
      to: '0x',
      token: 'usdc',
    })
    transferSync(client, { amount: { formatted: '1' }, to: '0x', token: '0x' })
  })

  test('client without tokens: only an address `token` is allowed', () => {
    const client = Client.create({ account, chain: zora, transport: http() })
    transferSync(client, { amount: { formatted: '1' }, to: '0x', token: '0x' })
    transferSync(client, {
      amount: { decimals: 18, formatted: '1' },
      to: '0x',
      token: '0x',
    })
    transferSync(client, {
      // @ts-expect-error - pass decimals under `amount` for formatted amounts
      decimals: 18,
      amount: { formatted: '1' },
      to: '0x',
      token: '0x',
    })
  })
})
