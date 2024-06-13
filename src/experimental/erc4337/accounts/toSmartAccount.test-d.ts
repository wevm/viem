import type { Address } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '../../../../test/src/anvil.js'
import type { Account } from '../../../types/account.js'
import { solady } from './implementations/solady.js'
import { toSmartAccount } from './toSmartAccount.js'
import type { SmartAccount } from './types.js'

const client = anvilMainnet.getClient()

test('uninitialized', async () => {
  const account = toSmartAccount({
    implementation: solady({
      factoryAddress: '0x',
      owner: '0x',
    }),
  })

  // Matches generic Account.
  expectTypeOf(account).toMatchTypeOf<Account>()
  // Matches generic SmartAccount.
  expectTypeOf(account).toMatchTypeOf<SmartAccount>()
  // Matches SmartAccount narrowed on `initialized`.
  expectTypeOf(account).toMatchTypeOf<SmartAccount<Address, false>>()

  // Account not initialized
  expectTypeOf(account.initialized).toEqualTypeOf<false>()

  // Widened address (address not provided).
  expectTypeOf(account.address).toEqualTypeOf<Address>()

  // Implementation properties are undefined (account not initialized).
  expectTypeOf(account.entryPointVersion).toEqualTypeOf<undefined>()
  expectTypeOf(account.getAddress).toEqualTypeOf<undefined>()
  expectTypeOf(account.getNonce).toEqualTypeOf<undefined>()
})

test('initialized', async () => {
  const account = toSmartAccount({
    client,
    implementation: solady({
      factoryAddress: '0x',
      owner: '0x',
    }),
  })

  // Matches generic Account.
  expectTypeOf(account).toMatchTypeOf<Account>()
  // Matches generic SmartAccount.
  expectTypeOf(account).toMatchTypeOf<SmartAccount>()
  // Matches SmartAccount narrowed on `initialized`.
  expectTypeOf(account).toMatchTypeOf<SmartAccount<Address, true>>()

  // Account not initialized
  expectTypeOf(account.initialized).toEqualTypeOf<true>()

  // Implementation properties are defined (account initialized).
  expectTypeOf(account.entryPointVersion).toEqualTypeOf<'0.7'>()
  expectTypeOf(account.getAddress).toEqualTypeOf<() => Promise<`0x${string}`>>()
  expectTypeOf(account.getNonce).toEqualTypeOf<() => Promise<bigint>>()
})

test('lazy initialized', async () => {
  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress: '0x',
      owner: '0x',
    }),
  }).initialize(client)

  // Matches generic Account.
  expectTypeOf(account).toMatchTypeOf<Account>()
  // Matches generic SmartAccount.
  expectTypeOf(account).toMatchTypeOf<SmartAccount>()
  // Matches SmartAccount narrowed on `initialized`.
  expectTypeOf(account).toMatchTypeOf<SmartAccount<Address, true>>()

  // Account not initialized
  expectTypeOf(account.initialized).toEqualTypeOf<true>()

  // Implementation properties are defined (account initialized).
  expectTypeOf(account.entryPointVersion).toEqualTypeOf<'0.7'>()
  expectTypeOf(account.getAddress).toEqualTypeOf<() => Promise<`0x${string}`>>()
  expectTypeOf(account.getNonce).toEqualTypeOf<() => Promise<bigint>>()
})

test('args: address', () => {
  const account = toSmartAccount({
    address: '0x0000000000000000000000000000000000000000',
    implementation: solady({
      factoryAddress: '0x',
      owner: '0x',
    }),
  })

  expectTypeOf(account).toMatchTypeOf<
    SmartAccount<'0x0000000000000000000000000000000000000000'>
  >()
  expectTypeOf(
    account.address,
  ).toEqualTypeOf<'0x0000000000000000000000000000000000000000'>()
})
