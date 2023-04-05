import { localhost } from '@wagmi/chains'
import { expectTypeOf, test } from 'vitest'

import type { JsonRpcAccount } from '../types'
import type { WalletClient } from './createWalletClient'
import { createWalletClient } from './createWalletClient'
import { http } from './transports'

test('with chain', () => {
  const client = createWalletClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createWalletClient({
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})

test('with account', () => {
  const client = createWalletClient({
    account: '0x',
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.account).toEqualTypeOf<JsonRpcAccount<'0x'>>({
    address: '0x',
    type: 'json-rpc',
  })
})

test('without account', () => {
  const client = createWalletClient({
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<WalletClient>()
  expectTypeOf(client.account).toEqualTypeOf(undefined)
})
