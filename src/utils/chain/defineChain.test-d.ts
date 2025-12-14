import { expectTypeOf, test } from 'vitest'
import type { Chain } from '../../index.js'
import { defineChain, extendSchema } from './defineChain.js'

test('default', () => {
  const chain = defineChain({
    id: 1,
    name: 'Test',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://localhost:8545'] } },
  })

  expectTypeOf(chain).toExtend<Chain>()
  expectTypeOf(chain.id).toEqualTypeOf<1>()
  expectTypeOf(chain.name).toEqualTypeOf<'Test'>()
})

test('behavior: extend', () => {
  const chain = defineChain({
    id: 1,
    name: 'Test',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://localhost:8545'] } },
  })

  const extended = chain.extend({
    foo: 'bar' as const,
  })

  expectTypeOf(extended).toExtend<Chain>()
  expectTypeOf(extended.foo).toEqualTypeOf<'bar'>()
  expectTypeOf(extended.id).toEqualTypeOf<1>()
})

test('behavior: schema', () => {
  const chain = defineChain({
    extendSchema: extendSchema<{ foo: string }>(),
    id: 1,
    name: 'Test',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://localhost:8545'] } },
  })

  const extended = chain.extend({
    foo: 'bar',
  })

  expectTypeOf(extended).toExtend<Chain>()
  expectTypeOf(extended.foo).toEqualTypeOf<'bar'>()
  expectTypeOf(extended.id).toEqualTypeOf<1>()

  // @ts-expect-error - missing required property
  chain.extend({})

  // @ts-expect-error - wrong type
  chain.extend({ foo: 123 })
})
