import type { Hex } from 'viem'
import { type Addresses, BlockHashHistory, SystemContracts } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('exposes EIP-2935 and system contract utilities', () => {
  expectTypeOf<
    typeof Addresses.blockHashHistory
  >().toEqualTypeOf<'0x0000F90827F1C53a10cb7A02335B175320002935'>()
  expectTypeOf(BlockHashHistory.encodeInput(1n)).toEqualTypeOf<Hex>()
  expectTypeOf(SystemContracts.isSystemContract('0x')).toEqualTypeOf<boolean>()
})
