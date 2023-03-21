import { test, expectTypeOf } from 'vitest'
import type { IsNever, IsUndefined } from './utils'

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

test('IsUndefined', () => {
  expectTypeOf<IsUndefined<undefined>>().toEqualTypeOf<true>()

  expectTypeOf<IsUndefined<never>>().toEqualTypeOf<false>()
  expectTypeOf<IsUndefined<'never'>>().toEqualTypeOf<false>()
  expectTypeOf<IsUndefined<null>>().toEqualTypeOf<false>()
  expectTypeOf<IsUndefined<0>>().toEqualTypeOf<false>()
  expectTypeOf<IsUndefined<false>>().toEqualTypeOf<false>()
  expectTypeOf<IsUndefined<[]>>().toEqualTypeOf<false>()
  expectTypeOf<IsUndefined<{}>>().toEqualTypeOf<false>()
  expectTypeOf<IsUndefined<undefined[]>>().toEqualTypeOf<false>()
})
