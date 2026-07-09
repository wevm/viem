import { describe, expect, test } from 'vitest'

import { fromRlp } from './fromRlp.js'

test('no bytes', () => {
  // hex -> bytes
  expect(fromRlp('0x', 'bytes')).toStrictEqual(new Uint8Array([]))
  // hex -> hex
  expect(fromRlp('0x')).toEqual('0x')
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
