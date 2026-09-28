import { Frame } from 'viem/frames'
import { expectTypeOf, test } from 'vitest'
import type { Frame as FrameType } from '../types/frame.js'

test('accepts numeric and bigint timestamps', () => {
  expectTypeOf(Frame.expiry(1_800_000_000)).toEqualTypeOf<FrameType>()
  expectTypeOf(Frame.expiry(1_800_000_000n)).toEqualTypeOf<FrameType>()
  // @ts-expect-error Deadlines use Unix seconds, not Date objects.
  Frame.expiry(new Date())
})
