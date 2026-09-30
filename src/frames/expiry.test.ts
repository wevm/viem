import * as Frame_ox from 'ox/Frame'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import * as FrameTransaction from './internal/transaction.js'

describe('expiry', () => {
  test.each([
    ['0s', 0],
    ['30s', 30],
    ['1m', 60],
    ['1h', 3_600],
    ['1d', 86_400],
    ['1w', 604_800],
    ['1.5h', 5_400],
  ] as const)('resolves duration %s', (duration, seconds) => {
    const before = Math.floor(Date.now() / 1_000)
    const helper = Frame.expiry(duration)
    const after = Math.floor(Date.now() / 1_000)
    const deadline = Number(
      FrameTransaction.resolve({ frames: [helper] }).frames[0]!.data!,
    )

    expect(deadline).toBeGreaterThanOrEqual(before + seconds)
    expect(deadline).toBeLessThanOrEqual(after + seconds)
  })

  test.each(['1y', '4y'] as const)(
    'preserves UTC calendar time for %s',
    (duration) => {
      const before = new Date()
      const helper = Frame.expiry(duration)
      const after = new Date()
      const deadline = Number(
        FrameTransaction.resolve({ frames: [helper] }).frames[0]!.data!,
      )
      const years = Number(duration.slice(0, -1))
      for (const date of [before, after]) {
        const month = date.getUTCMonth()
        date.setUTCFullYear(date.getUTCFullYear() + years)
        if (date.getUTCMonth() !== month) date.setUTCDate(0)
      }

      expect(deadline).toBeGreaterThanOrEqual(
        Math.floor(before.getTime() / 1_000),
      )
      expect(deadline).toBeLessThanOrEqual(Math.floor(after.getTime() / 1_000))
    },
  )

  test('keeps the creation deadline when prepared later', async () => {
    const helper = Frame.expiry('1h')
    const first = FrameTransaction.resolve({ frames: [helper] }).frames[0]!.data
    await new Promise((resolve) => setTimeout(resolve, 1_100))
    expect(
      FrameTransaction.resolve({ frames: [helper] }).frames[0]!.data,
    ).toEqual(first)
  })

  test.each([
    '',
    '1',
    '-1h',
    '1ms',
    '1mo',
    '0.5y',
    '999999999999999999999y',
    '999999999y',
    '1h30m',
    '1 day',
    'Infinityh',
    '0.1s',
    '999999999999999999999d',
  ])('rejects invalid duration %s', (duration) => {
    expect(() => Frame.expiry(duration)).toThrow()
  })

  test.each([
    ['2027-01-01', 1_798_761_600n],
    ['2027-01-01T00:00:00Z', 1_798_761_600n],
    ['2027-01-01T01:00:00+01:00', 1_798_761_600n],
    ['2026-12-31T19:00:00-05:00', 1_798_761_600n],
    ['2027-01-01T00:00:00.999Z', 1_798_761_600n],
  ] as const)('encodes date %s', (deadline, expected) => {
    const frame = FrameTransaction.resolve({ frames: [Frame.expiry(deadline)] })
      .frames[0]!
    expect(BigInt(frame.data!)).toBe(expected)
  })

  test.each([
    'not a date',
    '2027-01-01T12:00:00',
    '01/02/2027',
    '2027-13-01',
    '2027-01-01T25:00:00Z',
  ])('rejects invalid or ambiguous date %s', (deadline) =>
    expect(() => Frame.expiry(deadline)).toThrow(),
  )

  test.each([
    [0, '0x0000000000000000'],
    [1_800_000_000, '0x000000006b49d200'],
    [18_446_744_073_709_551_615n, '0xffffffffffffffff'],
  ] as const)('encodes deadline %s', (deadline, data) => {
    const frame = FrameTransaction.resolve({ frames: [Frame.expiry(deadline)] })
      .frames[0]!

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
    expect(() =>
      FrameTransaction.resolve({ frames: [Frame.expiry(deadline)] }),
    ).toThrow()
  })

  test('rejects misplaced and duplicate expiry frames', () => {
    for (const frames of [
      [Frame.calls([{ value: 1n }]), Frame.expiry(1n)],
      [Frame.expiry(1n), Frame.expiry(2n)],
    ])
      expect(() => FrameTransaction.resolve({ frames })).toThrow(
        'Frame.expiry: the expiry verifier must occupy frame index 0 and occur exactly once.',
      )
  })
})
