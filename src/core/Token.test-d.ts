import { describe, expectTypeOf, test } from 'vitest'

import { Account, Actions, Client, http, Token } from 'viem'
import { mainnet } from 'viem/chains'

const account = Account.fromPrivateKey(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

describe('minimal token: addresses + decimals + symbol only', () => {
  const usdc = Token.from({
    addresses: { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    decimals: 6,
    symbol: 'usdc',
  })

  test('assignable to `Token.Tokens`', () => {
    expectTypeOf(usdc).toMatchTypeOf<Token.Token>()
    expectTypeOf([usdc] as const).toMatchTypeOf<Token.Tokens>()
    expectTypeOf(usdc.currency).toEqualTypeOf<undefined>()
    expectTypeOf(usdc.symbol).toEqualTypeOf<'usdc'>()
  })

  test('optional metadata on the default `Token` accepts undefined', () => {
    expectTypeOf<Token.Token['currency']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Token.Token['name']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Token.Token['popular']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Token.Token['symbol']>().toEqualTypeOf<string | undefined>()
  })

  test('declared on `Client.create`: `token` narrows to declared symbols', () => {
    const client = Client.create({
      account,
      chain: mainnet,
      tokens: [usdc],
      transport: http(),
    })
    Actions.token.getBalance(client, { account: '0x', token: 'usdc' })
    Actions.token.getBalance(client, { account: '0x', token: '0x' })
    Actions.token.transferSync(client, { amount: 1n, to: '0x', token: 'usdc' })
    // @ts-expect-error - 'dai' is neither declared on the client nor an address
    Actions.token.getBalance(client, { account: '0x', token: 'dai' })
    // @ts-expect-error - 'dai' is neither declared on the client nor an address
    Actions.token.transferSync(client, { amount: 1n, to: '0x', token: 'dai' })
  })
})
