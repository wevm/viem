import { describe, expect, test } from 'vitest'
import * as FrameSponsorship from './sponsorship.js'
import type * as FrameTransaction from './transaction.js'

const transaction = {
  chainId: 8141,
  sender: '0x1111111111111111111111111111111111111111',
  nonceKeys: [0n],
  nonce: 0,
  frames: [
    {
      mode: 'sender',
      executionGas: 10_000n,
      stateGas: 500n,
    },
  ],
} as const satisfies FrameTransaction.Transaction

describe('getGas', () => {
  test('includes execution, state, and encoded nonce costs', () => {
    expect(FrameSponsorship.getGas(transaction)).toBe(23_023n)
  })

  test('adds state gas above the calldata floor', () => {
    expect(
      FrameSponsorship.getGas({
        ...transaction,
        frames: [
          {
            mode: 'sender',
            executionGas: 0n,
            stateGas: 500n,
            data: `0x${'ff'.repeat(100)}`,
          },
        ],
      }),
    ).toBe(19_567n)
  })

  test('charges value transfers to another account', () => {
    expect(
      FrameSponsorship.getGas({
        ...transaction,
        frames: [
          {
            ...transaction.frames[0],
            to: '0x2222222222222222222222222222222222222222',
            value: 1n,
          },
        ],
      }),
    ).toBe(29_023n)
    expect(
      FrameSponsorship.getGas({
        ...transaction,
        frames: [
          {
            ...transaction.frames[0],
            to: transaction.sender,
            value: 1n,
          },
        ],
      }),
    ).toBe(23_023n)
  })
})
