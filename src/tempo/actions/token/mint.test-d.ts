import { describe, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { mint } from './mint.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})
const token = '0x20c0000000000000000000000000000000000001'

describe('mint: options', () => {
  test('accepts base units or a formatted helper', () => {
    mint(client, { amount: 100n, to: '0x', token })
    mint(client, {
      amount: { decimals: 6, formatted: '1' },
      to: '0x',
      token,
    })
  })

  test('accepts an optional hex memo', () => {
    mint(client, { amount: 1n, memo: '0xdeadbeef', to: '0x', token })
    // @ts-expect-error - memo must be hex
    mint(client, { amount: 1n, memo: 'gm', to: '0x', token })
  })

  test('requires `to`', () => {
    // @ts-expect-error - must provide `to`
    mint(client, { amount: 1n, token })
  })
})

describe('mint.call', () => {
  test('with and without a client', () => {
    mint.call({ amount: 1n, to: '0x', token })
    mint.call(client, { amount: 1n, to: '0x', token })
  })
})
