import { describe, test } from 'vitest'

import { Account, Client, http } from 'viem'
import { mainnet, zora } from 'viem/chains'
import { usdc } from 'viem/tokens'

import { getBalance } from './getBalance.js'

const account = Account.fromPrivateKey(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

describe('getBalance: token selector', () => {
  test('client with tokens: selects by `token` symbol or address', () => {
    const client = Client.create({
      account,
      chain: mainnet,
      tokens: [usdc],
      transport: http(),
    })
    getBalance(client, { account: '0x', token: 'usdc' })
    getBalance(client, { account: '0x', token: '0x' })
  })

  test('rejects an unknown `token` symbol', () => {
    const client = Client.create({
      account,
      chain: mainnet,
      tokens: [usdc],
      transport: http(),
    })
    // @ts-expect-error - 'dai' is neither declared on the client nor an address
    getBalance(client, { account: '0x', token: 'dai' })
  })

  test('client without tokens: only an address `token` is allowed', () => {
    const client = Client.create({ account, chain: zora, transport: http() })
    getBalance(client, { account: '0x', token: '0x' })
    // @ts-expect-error - 'usdc' is not declared on the client
    getBalance(client, { account: '0x', token: 'usdc' })
  })
})
