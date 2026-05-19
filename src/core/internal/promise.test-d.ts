import { describe, expectTypeOf, test } from 'vp/test'

import { createBatchScheduler, withResolvers } from './promise.js'

describe('withResolvers', () => {
  test('types: exposes typed promise controls', () => {
    const resolvers = withResolvers<string>()

    expectTypeOf(resolvers.promise).toEqualTypeOf<Promise<string>>()
    expectTypeOf(resolvers.resolve)
      .parameter(0)
      .toEqualTypeOf<PromiseLike<string> | string>()
  })
})

describe('createBatchScheduler', () => {
  test('types: infers scheduled result tuples', () => {
    const scheduler = createBatchScheduler<number, readonly [number, number]>({
      fn: async (args) => [args[0]!, args[1]!] as const,
      id: 'batch:types',
    })

    expectTypeOf(scheduler.schedule(1)).toEqualTypeOf<
      Promise<createBatchScheduler.Resolved<readonly [number, number]>>
    >()
  })

  test('types: allows optional args for undefined parameters', () => {
    const scheduler = createBatchScheduler<undefined, readonly [string]>({
      fn: async () => ['ok'] as const,
      id: 'batch:undefined',
    })

    expectTypeOf(scheduler.schedule()).toEqualTypeOf<
      Promise<createBatchScheduler.Resolved<readonly [string]>>
    >()
  })
})
