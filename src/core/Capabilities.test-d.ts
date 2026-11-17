import { expectTypeOf, test } from 'vitest'

import type { Capabilities } from 'viem'

test('default: open capabilities bag', () => {
  expectTypeOf<Capabilities.Capabilities>().toMatchTypeOf<{
    [key: string]: unknown
  }>()

  // Known capabilities stay typed while unknown keys remain accessible.
  expectTypeOf<
    Capabilities.Capabilities<{ paymaster: { sponsored: boolean } }>
  >().toMatchTypeOf<{ paymaster: { sponsored: boolean } }>()
})

test('Schema: empty without registry augmentation', () => {
  expectTypeOf<Capabilities.Schema>().toEqualTypeOf<{}>()
})

test('Extract: falls back to the open bag when unregistered', () => {
  expectTypeOf<
    Capabilities.Extract<'unregistered', 'ReturnType'>
  >().toEqualTypeOf<Capabilities.Capabilities>()
})
