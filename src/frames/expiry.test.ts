import * as Frame_ox from 'ox/Frame'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { resolve } from './internal/transaction.js'

describe('expiry', () => {
  test.each([
    [0, '0x0000000000000000'],
    [1_800_000_000, '0x000000006b49d200'],
    [18_446_744_073_709_551_615n, '0xffffffffffffffff'],
  ] as const)('encodes deadline %s', (deadline, data) => {
    const frame = resolve({ frames: [Frame.expiry(deadline)] }).frames[0]!

    expect(frame).toMatchObject({
      data,
      flags: 'none',
      mode: 'verify',
      stateGas: 0n,
      to: '0x0000000000000000000000000000000000008141',
    })
    expect(Frame_ox.toRpc(frame)).toMatchObject({
      flags: '0x0',
      stateGas: '0x0',
      value: '0x0',
    })
  })

  test.each([
    -1,
    -1n,
    1.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    18_446_744_073_709_551_616n,
  ])('rejects invalid deadline %s', (deadline) => {
    expect(() => resolve({ frames: [Frame.expiry(deadline)] })).toThrow()
  })

  test('rejects misplaced and duplicate expiry frames', () => {
    for (const frames of [
      [Frame.calls([{ value: 1n }]), Frame.expiry(1n)],
      [Frame.expiry(1n), Frame.expiry(2n)],
    ])
      expect(() => resolve({ frames })).toThrow(
        'must be first and appear only once',
      )
  })
})
