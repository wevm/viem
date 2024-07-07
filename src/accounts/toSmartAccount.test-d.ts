import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '../../test/src/anvil.js'
import type { Account } from '../types/account.js'
import { type SoladyImplementation, solady } from './implementations/solady.js'
import { toSmartAccount } from './toSmartAccount.js'
import type { SmartAccount } from './types.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const account = await toSmartAccount({
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

  // Matches SmartAccount with implementation.
  expectTypeOf(account).toMatchTypeOf<SmartAccount<SoladyImplementation>>()
})
