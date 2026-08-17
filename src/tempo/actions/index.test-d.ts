import type { Address } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client } from 'viem/tempo'

test('exports domain types', () => {
  expectTypeOf<Actions.policy.PolicyType>().toEqualTypeOf<
    'blacklist' | 'whitelist'
  >()
  expectTypeOf<Actions.receivePolicy.BlockedReason>().toEqualTypeOf<
    'none' | 'receivePolicy' | 'tokenFilter'
  >()
  expectTypeOf<Actions.receivePolicy.Claimer>().toEqualTypeOf<
    'self' | 'sender' | Address.Address
  >()
  expectTypeOf<Actions.receivePolicy.PolicyRef>().toEqualTypeOf<
    'allow-all' | 'reject-all' | bigint
  >()
  expectTypeOf<Actions.receivePolicy.PolicyType>().toEqualTypeOf<
    'blacklist' | 'whitelist'
  >()
  expectTypeOf<Client.create.ErrorType>().not.toBeAny()
})
