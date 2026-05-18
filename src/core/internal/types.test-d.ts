import { describe, expectTypeOf, test } from 'vp/test'

import type {
  Assign,
  ExactPartial,
  Filter,
  IsNarrowable,
  IsNever,
  IsUndefined,
  IsUnion,
  MaybePartial,
  OneOf,
  Or,
  RequiredBy,
  UnionOmit,
} from './types.js'

describe('Assign', () => {
  test('overrides target properties', () => {
    expectTypeOf<
      Assign<{ a: string; b: number }, { a: number }>
    >().toEqualTypeOf<{
      a: number
      b: number
    }>()
  })
})

describe('ExactPartial', () => {
  test('makes properties optional and keeps undefined explicit', () => {
    expectTypeOf<ExactPartial<{ a: string; b: number }>>().toEqualTypeOf<{
      a?: string | undefined
      b?: number | undefined
    }>()
  })
})

describe('Filter', () => {
  test('keeps matching tuple members', () => {
    expectTypeOf<Filter<[1, 'foo', false, 'baz'], 1 | boolean>>().toEqualTypeOf<
      readonly [1, false]
    >()
  })
})

describe('IsNarrowable', () => {
  test('detects narrower types', () => {
    expectTypeOf<IsNarrowable<'foo', string>>().toEqualTypeOf<true>()
    expectTypeOf<IsNarrowable<string, string>>().toEqualTypeOf<false>()
  })
})

describe('IsNever', () => {
  test('detects never', () => {
    expectTypeOf<IsNever<never>>().toEqualTypeOf<true>()
    expectTypeOf<IsNever<string>>().toEqualTypeOf<false>()
  })
})

describe('IsUndefined', () => {
  test('detects undefined', () => {
    expectTypeOf<IsUndefined<undefined>>().toEqualTypeOf<true>()
    expectTypeOf<IsUndefined<never>>().toEqualTypeOf<false>()
    expectTypeOf<IsUndefined<string>>().toEqualTypeOf<false>()
  })
})

describe('IsUnion', () => {
  test('detects unions', () => {
    expectTypeOf<IsUnion<'foo' | 'bar'>>().toEqualTypeOf<true>()
    expectTypeOf<IsUnion<'foo'>>().toEqualTypeOf<false>()
  })
})

describe('MaybePartial', () => {
  test('switches partial behavior by boolean flag', () => {
    expectTypeOf<MaybePartial<{ a: string; b: number }, true>>().toEqualTypeOf<{
      a?: string | undefined
      b?: number | undefined
    }>()
    expectTypeOf<
      MaybePartial<{ a: string; b: number }, false>
    >().toEqualTypeOf<{
      a: string
      b: number
    }>()
  })
})

describe('OneOf', () => {
  test('marks sibling union keys as unavailable', () => {
    expectTypeOf<OneOf<{ a: string } | { b: number }>>().toEqualTypeOf<
      { a: string; b?: undefined } | { a?: undefined; b: number }
    >()
  })
})

describe('Or', () => {
  test('detects true tuple members', () => {
    expectTypeOf<Or<[false, true, false]>>().toEqualTypeOf<true>()
    expectTypeOf<Or<[false, false, false]>>().toEqualTypeOf<false>()
  })
})

describe('RequiredBy', () => {
  test('requires selected properties', () => {
    expectTypeOf<RequiredBy<{ a?: string; b: number }, 'a'>>().toEqualTypeOf<{
      a: string
      b: number
    }>()
  })
})

describe('UnionOmit', () => {
  test('omits keys across union members', () => {
    expectTypeOf<
      UnionOmit<
        { a: string; b: number } | { a: string; b: undefined; c: number },
        'a'
      >
    >().toEqualTypeOf<{ b: number } | { b: undefined; c: number }>()
  })
})
