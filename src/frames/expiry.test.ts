import * as Frame_ox from 'ox/Frame'
import { Frame } from 'viem/frames'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { resolve } from './internal/transaction.js'

describe('expiry', () => {
  afterEach(() => vi.useRealTimers())

  test.each([
    ['0s', 1_800_000_000n],
    ['30s', 1_800_000_030n],
    ['1m', 1_800_000_060n],
    ['1h', 1_800_003_600n],
    ['1d', 1_800_086_400n],
    ['1w', 1_800_604_800n],
    ['1.5h', 1_800_005_400n],
  ] as const)('resolves duration %s once', (duration, expected) => {
    vi.useFakeTimers()
    vi.setSystemTime(1_800_000_000_500)
    const helper = Frame.expiry(duration)
    vi.setSystemTime(1_800_100_000_500)

    const resolveDeadline = () =>
      BigInt(resolve({ frames: [helper] }).frames[0]!.data!)
    expect(resolveDeadline()).toBe(expected)
    vi.advanceTimersByTime(60_000)
    expect(resolveDeadline()).toBe(expected)
  })

  test.each([
    '',
    '1',
    '-1h',
    '1ms',
    '1y',
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
    const frame = resolve({ frames: [Frame.expiry(deadline)] }).frames[0]!
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
