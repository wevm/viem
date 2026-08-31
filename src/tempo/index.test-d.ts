import type { Owner } from 'ox/tempo/MultisigConfig'
import { expectTypeOf, test } from 'vitest'
import type { z_MultisigConfigOwner, z_MultisigOwnerState } from './index.js'
import type { MultisigOwnerState } from './Transaction.js'

test('exports types required for inference', () => {
  expectTypeOf<z_MultisigConfigOwner>().toEqualTypeOf<Owner>()
  expectTypeOf<z_MultisigOwnerState>().toEqualTypeOf<MultisigOwnerState>()
})
