import { Frame } from 'viem/frames'
import { expectTypeOf, test } from 'vitest'
import type { Frame as FrameType } from '../types/frame.js'

test('accepts durations and date strings', () => {
  expectTypeOf(Frame.expiry('30s')).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry('5m')).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry('1.5h')).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry('1d')).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry('2w')).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry('1y')).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry('2027-01-01')).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry('2027-01-01T12:00:00Z')).toEqualTypeOf<FrameType>()
  expectTypeOf<string>().toExtend<Parameters<typeof Frame.expiry>[0]>()
})

test('accepts numeric and bigint timestamps', () => {
  expectTypeOf(Frame.expiry(1_800_000_000)).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry(1_800_000_000n)).toEqualTypeOf<FrameType>()
  // @ts-expect-error Deadlines use Unix seconds, not Date objects.
  Frame.expiry(new Date())
})
