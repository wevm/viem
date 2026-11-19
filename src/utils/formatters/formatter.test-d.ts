import { expectTypeOf, test } from 'vitest'
import { defineFormatter } from './formatter.js'

test('preserves override unions', () => {
  type Result =
    | { type: 'first'; value: bigint }
    | { type: 'second'; value: string }
  const formatter = defineFormatter(
    'test',
    (value: Result) => value,
  )({
    format: (value: Result): Result => value,
  })
  expectTypeOf<ReturnType<typeof formatter.format>>().toEqualTypeOf<Result>()
})

test('marks excluded properties as never', () => {
  const formatter = defineFormatter(
    'test',
    (value: { removed: string }) => value,
  )({
    exclude: ['removed'],
    format: (value: { value: bigint }) => value,
  })
  expectTypeOf<ReturnType<typeof formatter.format>>().toEqualTypeOf<
    { value: bigint } & { removed: never }
  >()
})
