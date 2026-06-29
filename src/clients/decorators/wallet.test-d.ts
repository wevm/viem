import { describe, expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { localhost, mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { usdc } from '../../tokens/definitions/usdc.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { publicActions } from './public.js'
import { walletActions } from './wallet.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const client = createClient({
  account,
  chain: mainnet,
  tokens: [usdc],
  transport: http(),
})

describe('token', () => {
  const extended = client.extend(publicActions).extend(walletActions)

  test('attaches a single `token` namespace', () => {
    expectTypeOf(extended).toHaveProperty('token')
    expectTypeOf(extended.token.transfer).toBeFunction()
    expectTypeOf(extended.token.approve).toBeFunction()
    expectTypeOf(extended.token.getBalance).toBeFunction()
    expectTypeOf(extended.token.getTotalSupply).toBeFunction()
  })

  describe('token selector', () => {
    test('selects by `token` name', () => {
      extended.token.transfer({
        token: 'usdc',
        to: '0x',
        amount: { formatted: '10.5' },
      })
      extended.token.approve({
        token: 'usdc',
        spender: '0x',
        amount: { formatted: '10.5' },
      })
    })

    test('selects by `token` address', () => {
      extended.token.transfer({
        token: '0x',
        to: '0x',
        amount: { formatted: '1' },
      })
    })

    test('rejects an unknown `token` name', () => {
      extended.token.transfer({
        // @ts-expect-error - 'dai' is neither declared on mainnet nor an address
        token: 'dai',
        to: '0x',
        amount: { formatted: '1' },
      })
    })

    test('requires `token`', () => {
      // @ts-expect-error - must provide `token`
      extended.token.transfer({ to: '0x', amount: { formatted: '1' } })
    })

    test('decimals optional for a `token` address', () => {
      extended.token.transfer({
        token: '0x',
        to: '0x',
        amount: { formatted: '1' },
      })
      extended.token.transfer({
        token: '0x',
        to: '0x',
        amount: { decimals: 6, formatted: '1' },
      })
      extended.token.transfer({
        token: '0x',
        // @ts-expect-error - pass decimals under `amount` for formatted amounts
        decimals: 6,
        to: '0x',
        amount: { formatted: '1' },
      })
    })
  })

  describe('amount', () => {
    test('accepts base units and formatted helper', () => {
      extended.token.transfer({ token: 'usdc', to: '0x', amount: 1n })
      extended.token.transfer({
        token: 'usdc',
        to: '0x',
        amount: { decimals: 6, formatted: '10.5' },
      })
      extended.token.transfer({
        token: 'usdc',
        from: '0x',
        to: '0x',
        amount: { formatted: '1' },
      })
    })

    test('rejects a bare string amount', () => {
      // @ts-expect-error - use base units or a formatted helper
      extended.token.transfer({ token: 'usdc', to: '0x', amount: '1' })
    })
  })

  describe('write helpers', () => {
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
        amount: { formatted: '1' },
      })
      expectTypeOf(result.receipt).toEqualTypeOf<TransactionReceipt>()
    })
  })
})

describe('chain without tokens', () => {
  // `localhost` declares no `tokens`, so only an address `token` is allowed.
  const extended = createClient({
    account,
    chain: localhost,
    transport: http(),
  })
    .extend(publicActions)
    .extend(walletActions)

  test('the `token` namespace still exists', () => {
    expectTypeOf(extended.token.transfer).toBeFunction()
  })

  test('`token` must be an address; formatted amount decimals are optional', () => {
    extended.token.transfer({
      token: '0x',
      to: '0x',
      amount: { decimals: 6, formatted: '1' },
    })
    extended.token.transfer({
      token: '0x',
      to: '0x',
      amount: { formatted: '1' },
    })
    extended.token.transfer({
      token: '0x',
      // @ts-expect-error - pass decimals under `amount` for formatted amounts
      decimals: 6,
      to: '0x',
      amount: { formatted: '1' },
    })
    // @ts-expect-error - `token` is required when the client has no `tokens`
    extended.token.transfer({ to: '0x', amount: { formatted: '1' } })
  })
})

describe('client without a chain', () => {
  const extended = createClient({ account, transport: http() })
    .extend(publicActions)
    .extend(walletActions)

  test('the `token` namespace still exists', () => {
    expectTypeOf(extended.token.transfer).toBeFunction()
  })
})
