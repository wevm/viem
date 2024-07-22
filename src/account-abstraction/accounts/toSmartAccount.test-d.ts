import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import type { Account } from '../../types/account.js'
import { toSoladySmartAccount } from './implementations/toSoladySmartAccount.js'
import type { SmartAccount } from './types.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const account = await toSoladySmartAccount({
    client,
    owner: '0x',
  })

  // Matches generic Account.
  expectTypeOf(account).toMatchTypeOf<Account>()

  // Matches generic SmartAccount.
  expectTypeOf(account).toMatchTypeOf<SmartAccount>()

  // Matches narrowed Smart Account.
  expectTypeOf(account).toMatchTypeOf<
    SmartAccount<
      typeof account.entryPoint.abi,
      typeof account.entryPoint.version
    >
  >()
})
