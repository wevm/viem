import { privateKeyToAccount } from 'viem/accounts'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import * as FrameTransaction from './internal/transaction.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

describe('verify', () => {
  test.each([1, 3, 'approvePayment', 'approveExecutionAndPayment'] as const)(
    'preserves an existing payment approval: %s',
    (flags) => {
      const prepared = FrameTransaction.resolve({
        frames: [
          Frame.verify({ account }),
          { mode: 'verify' as const, flags, to: account.address },
        ],
      })
      expect(
        prepared.frames.map((frame) => {
          const { flags } = frame
          return flags
        }),
      ).toEqual(['approveExecution', flags])
    },
  )

  test('keeps its own combined approval', () => {
    const prepared = FrameTransaction.resolve({
      frames: [Frame.verify({ account })],
    })
    expect(
      FrameTransaction.resolve(prepared).frames[0]?.flags,
    ).toMatchInlineSnapshot(`"approveExecutionAndPayment"`)
  })
})
