import { expectTypeOf, test } from 'vitest'
import { Actions } from 'viem/tempo'

test('from and memo are mutually exclusive', () => {
  const options = {
    amount: 1n,
    token: '0x20c0000000000000000000000000000000000001',
  } as const

  expectTypeOf({
    ...options,
    from: options.token,
  }).toExtend<Actions.token.burn.Args>()
  expectTypeOf({
    ...options,
    memo: '0x' as const,
  }).toExtend<Actions.token.burn.Args>()
  expectTypeOf({
    ...options,
    from: options.token,
    memo: '0x' as const,
  }).not.toExtend<Actions.token.burn.Args>()
})
