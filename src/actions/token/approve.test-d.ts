import { describe, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet, zora } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { approve } from './approve.js'
import { approveSync } from './approveSync.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

describe('approve: token selector', () => {
  test('chain with tokens: selects by `token` name or address', () => {
    const client = createClient({ account, chain: mainnet, transport: http() })
    approve(client, { amount: '1', spender: '0x', token: 'usdc' })
    approve(client, { amount: '1', spender: '0x', token: '0x' })
    approve(client, { amount: '1', decimals: 6, spender: '0x', token: '0x' })
  })

  test('rejects an unknown `token` name', () => {
    const client = createClient({ account, chain: mainnet, transport: http() })
    // @ts-expect-error - 'dai' is neither declared on mainnet nor an address
    approve(client, { amount: '1', spender: '0x', token: 'dai' })
  })

  test('requires `token`', () => {
    const client = createClient({ account, chain: mainnet, transport: http() })
    // @ts-expect-error - must provide `token`
    approve(client, { amount: '1', spender: '0x' })
  })

  test('chain without tokens: only an address `token` is allowed', () => {
    const client = createClient({ account, chain: zora, transport: http() })
    approve(client, { amount: '1', spender: '0x', token: '0x' })
    approve(client, { amount: '1', decimals: 18, spender: '0x', token: '0x' })
  })
})

describe('approveSync: token selector', () => {
  test('chain with tokens: selects by `token` name or address', () => {
    const client = createClient({ account, chain: mainnet, transport: http() })
    approveSync(client, { amount: '1', spender: '0x', token: 'usdc' })
    approveSync(client, { amount: '1', spender: '0x', token: '0x' })
  })

  test('chain without tokens: only an address `token` is allowed', () => {
    const client = createClient({ account, chain: zora, transport: http() })
    approveSync(client, { amount: '1', spender: '0x', token: '0x' })
    approveSync(client, {
      amount: '1',
      decimals: 18,
      spender: '0x',
      token: '0x',
    })
  })
})
