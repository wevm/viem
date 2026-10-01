import { Frame } from 'viem/frames'
import { expectTypeOf, test } from 'vitest'

test('accepts durations and date strings', () => {
  expectTypeOf(Frame.expiry('30s')).toEqualTypeOf<Frame.Frame>()
  expectTypeOf(Frame.expiry('5m')).toEqualTypeOf<Frame.Frame>()
  expectTypeOf(Frame.expiry('1.5h')).toEqualTypeOf<Frame.Frame>()
  expectTypeOf(Frame.expiry('1d')).toEqualTypeOf<Frame.Frame>()
  expectTypeOf(Frame.expiry('2w')).toEqualTypeOf<Frame.Frame>()
  expectTypeOf(Frame.expiry('1y')).toEqualTypeOf<Frame.Frame>()
  expectTypeOf(Frame.expiry('2027-01-01')).toEqualTypeOf<Frame.Frame>()
  expectTypeOf(
    Frame.expiry('2027-01-01T12:00:00Z'),
  ).toEqualTypeOf<Frame.Frame>()
  expectTypeOf<string>().toExtend<Parameters<typeof Frame.expiry>[0]>()
})

test('accepts numeric and bigint timestamps', () => {
  expectTypeOf(Frame.expiry(1_800_000_000)).toEqualTypeOf<Frame.Frame>()
  expectTypeOf(Frame.expiry(1_800_000_000n)).toEqualTypeOf<Frame.Frame>()
  // @ts-expect-error Deadlines use Unix seconds, not Date objects.
  Frame.expiry(new Date())
})
