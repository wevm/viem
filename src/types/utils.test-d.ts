import { test, expectTypeOf } from 'vitest'
import type { IsNever } from './utils'

test('IsNever', () => {
  expectTypeOf<IsNever<never>>().toEqualTypeOf<true>()

  expectTypeOf<IsNever<'never'>>().toEqualTypeOf<false>()
  expectTypeOf<IsNever<undefined>>().toEqualTypeOf<false>()
  expectTypeOf<IsNever<null>>().toEqualTypeOf<false>()
  expectTypeOf<IsNever<0>>().toEqualTypeOf<false>()
  expectTypeOf<IsNever<false>>().toEqualTypeOf<false>()
  expectTypeOf<IsNever<[]>>().toEqualTypeOf<false>()
  expectTypeOf<IsNever<{}>>().toEqualTypeOf<false>()
  expectTypeOf<IsNever<never[]>>().toEqualTypeOf<false>()
})
