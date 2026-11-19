import { describe, expect, test } from 'vitest'

import type { Hex } from '../../types/misc.js'
import { fromRlp } from './fromRlp.js'
import { bytesToHex } from './toHex.js'
import { toRlp } from './toRlp.js'

test('no bytes', () => {
  // hex -> bytes
  expect(fromRlp('0x', 'bytes')).toStrictEqual(new Uint8Array([]))
  // hex -> hex
  expect(fromRlp('0x')).toEqual('0x')
})

describe('hex input', () => {
  test('mixed case and odd length', () => {
    expect(fromRlp('0xC3820ABC')).toMatchInlineSnapshot(`
      [
        "0x0abc",
      ]
    `)
    expect(fromRlp('0x1')).toMatchInlineSnapshot(`"0x01"`)
  })

  test('short and long inputs decode their leaves', () => {
    const leaves = (count: number) =>
      Array.from(
        { length: count },
        (_, i) => `0x${i.toString(16).padStart(64, 'a')}` as const,
      )
    // Past 4096 hex characters, small leaves are copied instead of sliced.
    for (const count of [61, 62, 63, 200]) {
      const list = toRlp(leaves(count))
      expect(fromRlp(list)).toEqual(leaves(count))
      expect(fromRlp(list.toUpperCase().replace('0X', '0x') as Hex)).toEqual(
        leaves(count),
      )
    }
    const blob = `0x${'ab'.repeat(131_072)}` as const
    expect(fromRlp(toRlp([blob, '0x01', leaves(1)]))).toEqual([
      blob,
      '0x01',
      leaves(1),
    ])
  })

  test('errors: truncated long input', () => {
    const list = toRlp(
      Array.from({ length: 200 }, () => `0x${'ab'.repeat(32)}` as const),
    )
    expect(() =>
      fromRlp(list.slice(0, -2) as `0x${string}`),
    ).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`6602\` is out of bounds (\`0 < position < 6602\`).

      Version: viem@x.y.z]
    `)
  })
})

// `toRlp.test.ts` only runs with `TEST_RLP=true`.
describe('toRlp hex leaves', () => {
  test('any case or length', () => {
    const value = ['0xABC', '0x0aBc', '0x8', '0x', '0x0180'] as const

    const encoded = toRlp(value)

    expect(encoded).toMatchInlineSnapshot(`"0xcb820abc820abc0880820180"`)
    expect(encoded).toBe(bytesToHex(toRlp(value, 'bytes')))
    expect(fromRlp(encoded)).toMatchInlineSnapshot(`
      [
        "0x0abc",
        "0x0abc",
        "0x08",
        "0x",
        "0x0180",
      ]
    `)
  })

  test('errors: invalid hex leaf', () => {
    expect(() => toRlp(['0x12', ['0xzz']])).toThrowErrorMatchingInlineSnapshot(`
      [BaseError: Invalid byte sequence ("zz" in "zz").

      Version: viem@x.y.z]
    `)
  })
})

describe('list', () => {
  test('no bytes', () => {
    // bytes -> hex
    expect(fromRlp(Uint8Array.from([0xc0]), 'hex')).toEqual([])
    // hex -> bytes
    expect(fromRlp('0xc0', 'bytes')).toEqual([])
  })

  test('inner no bytes', () => {
    // bytes -> hex
    expect(fromRlp(Uint8Array.from([0xc1, 0xc0]), 'hex')).toEqual([[]])
    // hex -> bytes
    expect(fromRlp('0xc1c0', 'bytes')).toEqual([[]])
  })

  test('deeply nested list', () => {
    expect(() =>
      fromRlp(getNestedList(1025), 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpDepthLimitExceededError: RLP depth limit of \`1024\` exceeded.

      Version: viem@x.y.z]
    `)
  })
})

describe('trailing bytes', () => {
  // RLP payloads encode exactly one item (Yellow Paper, Appendix B).
  test('after string item', () => {
    expect(() =>
      fromRlp('0x80deadbeef', 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpTrailingBytesError: RLP payload encodes a single item, but \`4\` trailing bytes remain.

      Version: viem@x.y.z]
    `)
  })

  test('after list item', () => {
    expect(() =>
      fromRlp('0xc2010203', 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpTrailingBytesError: RLP payload encodes a single item, but \`1\` trailing byte remains.

      Version: viem@x.y.z]
    `)
  })

  test('after empty list', () => {
    expect(() => fromRlp('0xc000', 'hex')).toThrowErrorMatchingInlineSnapshot(`
      [RlpTrailingBytesError: RLP payload encodes a single item, but \`1\` trailing byte remains.

      Version: viem@x.y.z]
    `)
  })

  test('bytes input', () => {
    expect(() =>
      fromRlp(Uint8Array.from([0x80, 0xde, 0xad]), 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpTrailingBytesError: RLP payload encodes a single item, but \`2\` trailing bytes remain.

      Version: viem@x.y.z]
    `)
  })

  test('valid single items still decode', () => {
    expect(fromRlp('0x80', 'hex')).toEqual('0x')
    expect(fromRlp('0xc0', 'hex')).toEqual([])
    expect(fromRlp('0xc1c0', 'hex')).toEqual([[]])
    expect(fromRlp('0x83646f67', 'hex')).toEqual('0x646f67')
  })
})

describe('list boundary', () => {
  // Items must consume exactly the declared list length.
  test('item extends beyond list', () => {
    // `0xc1` declares 1 payload byte; `0x82aabb` consumes 3.
    expect(() =>
      fromRlp('0xc182aabb', 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpListBoundaryExceededError: RLP list items consumed \`3\` bytes but the list declared a length of \`1\`.

      Version: viem@x.y.z]
    `)
  })

  test('item extends beyond nested list', () => {
    expect(() =>
      fromRlp('0xc3c182aabb', 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpListBoundaryExceededError: RLP list items consumed \`3\` bytes but the list declared a length of \`1\`.

      Version: viem@x.y.z]
    `)
  })

  test('item extends beyond list with trailing bytes', () => {
    expect(() =>
      fromRlp('0xc182aabbff', 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpListBoundaryExceededError: RLP list items consumed \`3\` bytes but the list declared a length of \`1\`.

      Version: viem@x.y.z]
    `)
  })
})

describe('non-canonical', () => {
  // Every value has exactly one RLP encoding (Yellow Paper, Appendix B).
  test('single byte below 0x80 with a length prefix', () => {
    expect(() => fromRlp('0x8100', 'hex')).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: single byte below \`0x80\` has a length prefix.

      Version: viem@x.y.z]
    `)
    expect(() => fromRlp('0x817f', 'hex')).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: single byte below \`0x80\` has a length prefix.

      Version: viem@x.y.z]
    `)
  })

  test('short string with a long-form length', () => {
    expect(() => fromRlp('0xb800', 'hex')).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: length \`0\` does not use the shortest length prefix.

      Version: viem@x.y.z]
    `)
    expect(() =>
      fromRlp(`0xb837${'00'.repeat(55)}`, 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: length \`55\` does not use the shortest length prefix.

      Version: viem@x.y.z]
    `)
  })

  test('short list with a long-form length', () => {
    expect(() => fromRlp('0xf800', 'hex')).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: length \`0\` does not use the shortest length prefix.

      Version: viem@x.y.z]
    `)
  })

  test('long-form length with a leading zero byte', () => {
    expect(() =>
      fromRlp(`0xb90038${'00'.repeat(56)}`, 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: length \`56\` does not use the shortest length prefix.

      Version: viem@x.y.z]
    `)
    expect(() =>
      fromRlp(`0xf90038${'80'.repeat(56)}`, 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: length \`56\` does not use the shortest length prefix.

      Version: viem@x.y.z]
    `)
    expect(() =>
      fromRlp(`0xb900ff${'00'.repeat(255)}`, 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: length \`255\` does not use the shortest length prefix.

      Version: viem@x.y.z]
    `)
    expect(() =>
      fromRlp(`0xba000100${'00'.repeat(256)}`, 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: length \`256\` does not use the shortest length prefix.

      Version: viem@x.y.z]
    `)
    expect(() =>
      fromRlp(`0xbb00010000${'00'.repeat(0x10000)}`, 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RlpNonCanonicalError: RLP payload is not canonically encoded: length \`65536\` does not use the shortest length prefix.

      Version: viem@x.y.z]
    `)
  })

  test('canonical boundaries still decode', () => {
    expect(fromRlp('0x00', 'hex')).toEqual('0x00')
    expect(fromRlp('0x7f', 'hex')).toEqual('0x7f')
    expect(fromRlp('0x8180', 'hex')).toEqual('0x80')
    expect(fromRlp(`0xb7${'00'.repeat(55)}`, 'hex')).toEqual(
      `0x${'00'.repeat(55)}`,
    )
    expect(fromRlp(`0xb838${'00'.repeat(56)}`, 'hex')).toEqual(
      `0x${'00'.repeat(56)}`,
    )
    expect(fromRlp(`0xb90100${'00'.repeat(256)}`, 'hex')).toEqual(
      `0x${'00'.repeat(256)}`,
    )
    expect(fromRlp(`0xf838${'80'.repeat(56)}`, 'hex')).toEqual(
      Array(56).fill('0x'),
    )
  })
})

function getNestedList(depth: number) {
  let payload = new Uint8Array()
  for (let i = 0; i < depth; i++) payload = encodeList(payload)
  return payload
}

function encodeList(payload: Uint8Array) {
  const length = payload.length
  if (length <= 55) {
    const out = new Uint8Array(1 + length)
    out[0] = 0xc0 + length
    out.set(payload, 1)
    return out
  }

  const lengthBytes = []
  let remaining = length
  while (remaining > 0) {
    lengthBytes.unshift(remaining & 0xff)
    remaining >>= 8
  }

  const out = new Uint8Array(1 + lengthBytes.length + length)
  out[0] = 0xf7 + lengthBytes.length
  out.set(lengthBytes, 1)
  out.set(payload, 1 + lengthBytes.length)
  return out
}
