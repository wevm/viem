import { Abi, parseAbi } from 'abitype'
import { seaportAbi, seaportHumanReadableAbi } from 'abitype/test'
import { test, expectTypeOf } from 'vitest'
import { IsInferrableAbi } from './abi'

test('IsInferrableAbi', () => {
  expectTypeOf<IsInferrableAbi<typeof seaportAbi>>().toEqualTypeOf<true>()
  const res = parseAbi(seaportHumanReadableAbi)
  expectTypeOf<IsInferrableAbi<typeof res>>().toEqualTypeOf<true>()

  expectTypeOf<IsInferrableAbi<Abi>>().toEqualTypeOf<false>()
})
