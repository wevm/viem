import { describe, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet, zora } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { usdc } from '../../tokens/definitions/usdc.js'
import { approve } from './approve.js'
import { approveSync } from './approveSync.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

describe('approve: token selector', () => {
  test('client with tokens: selects by `token` name or address', () => {
    const client = createClient({
      account,
      chain: mainnet,
      tokens: { usdc },
      transport: http(),
    })
    approve(client, { amount: 1n, spender: '0x', token: 'usdc' })
    approve(client, {
      amount: { formatted: '1' },
      spender: '0x',
      token: 'usdc',
    })
    approve(client, { amount: { formatted: '1' }, spender: '0x', token: '0x' })
    approve(client, {
      amount: { decimals: 6, formatted: '1' },
      spender: '0x',
      token: '0x',
    })
  })

  test('rejects a bare string amount', () => {
    const client = createClient({
      account,
      chain: mainnet,
      tokens: { usdc },
      transport: http(),
    })
    // @ts-expect-error - use base units or a formatted helper
    approve(client, { amount: '1', spender: '0x', token: 'usdc' })
  })

  test('rejects top-level `decimals`', () => {
    const client = createClient({
      account,
      chain: mainnet,
      tokens: { usdc },
      transport: http(),
    })
    approve(client, {
      // @ts-expect-error - pass decimals under `amount` for formatted amounts
      decimals: 6,
      amount: { formatted: '1' },
      spender: '0x',
      token: 'usdc',
    })
  })

  test('rejects an unknown `token` name', () => {
    const client = createClient({
      account,
      chain: mainnet,
      tokens: { usdc },
      transport: http(),
    })
    // @ts-expect-error - 'dai' is neither declared on the client nor an address
    approve(client, { amount: { formatted: '1' }, spender: '0x', token: 'dai' })
  })

  test('requires `token`', () => {
    const client = createClient({ account, chain: mainnet, transport: http() })
    // @ts-expect-error - must provide `token`
    approve(client, { amount: { formatted: '1' }, spender: '0x' })
  })

  test('chain without tokens: only an address `token` is allowed', () => {
    const client = createClient({ account, chain: zora, transport: http() })
    approve(client, { amount: { formatted: '1' }, spender: '0x', token: '0x' })
    approve(client, {
      amount: { decimals: 18, formatted: '1' },
      spender: '0x',
      token: '0x',
    })
  })
})

describe('approveSync: token selector', () => {
  test('client with tokens: selects by `token` name or address', () => {
    const client = createClient({
      account,
      chain: mainnet,
      tokens: { usdc },
      transport: http(),
    })
    approveSync(client, { amount: 1n, spender: '0x', token: 'usdc' })
    approveSync(client, {
      amount: { formatted: '1' },
      spender: '0x',
      token: 'usdc',
    })
    approveSync(client, {
      amount: { formatted: '1' },
      spender: '0x',
      token: '0x',
    })
  })

  test('chain without tokens: only an address `token` is allowed', () => {
    const client = createClient({ account, chain: zora, transport: http() })
    approveSync(client, {
      amount: { formatted: '1' },
      spender: '0x',
      token: '0x',
    })
    approveSync(client, {
      amount: { decimals: 18, formatted: '1' },
      spender: '0x',
      token: '0x',
    })
    approveSync(client, {
      // @ts-expect-error - pass decimals under `amount` for formatted amounts
      decimals: 18,
      amount: { formatted: '1' },
      spender: '0x',
      token: '0x',
    })
  })
})
