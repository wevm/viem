import { privateKeyToAccount } from 'viem/accounts'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { resolve } from './internal/transaction.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

describe('verify', () => {
  test.each([1, 3, 'approvePayment', 'approveExecutionAndPayment'] as const)(
    'preserves an existing payment approval: %s',
    (flags) => {
      const prepared = resolve({
        frames: [
          Frame.verify({ account }),
          { mode: 'verify' as const, flags, to: account.address },
        ],
      })
      expect(prepared.frames.map(({ flags }) => flags)).toEqual([
        'approveExecution',
        flags,
      ])
    },
  )

  test('keeps its own combined approval', () => {
    const prepared = resolve({ frames: [Frame.verify({ account })] })
    expect(resolve(prepared).frames[0]?.flags).toMatchInlineSnapshot(
      `"approveExecutionAndPayment"`,
    )
  })
})
