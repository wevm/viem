import { describe, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet, zora } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { usdc } from '../../tokens/definitions/usdc.js'
import { transfer } from './transfer.js'
import { transferSync } from './transferSync.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

describe('transfer: token selector', () => {
  const client = createClient({
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
    const client = createClient({ account, chain: zora, transport: http() })
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

describe('transferSync: token selector', () => {
  test('client with tokens: selects by `token` symbol or address', () => {
    const client = createClient({
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
    const client = createClient({ account, chain: zora, transport: http() })
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
