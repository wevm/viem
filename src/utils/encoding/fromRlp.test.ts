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
  // RLP is a bijection (Ethereum Yellow Paper, Appendix B): a payload encodes
  // exactly one item with no leftover bytes. geth rejects with `rlp: input
  // contains more than one value` and ethers with `unexpected junk after rlp
  // payload`. viem must not silently drop the trailing bytes.
  test('after string item', () => {
    // `0x80` encodes `''`; the trailing `deadbeef` is junk.
    expect(() =>
      fromRlp('0x80deadbeef', 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [BaseError: Unexpected trailing bytes: RLP payload encodes a single item but 4 byte(s) remain after it.

      Version: viem@x.y.z]
    `)
  })

  test('after list item', () => {
    // `0xc2 0x01 0x02` is a 2-byte list `['0x01','0x02']`; trailing `03` is junk.
    expect(() =>
      fromRlp('0xc2010203', 'hex'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [BaseError: Unexpected trailing bytes: RLP payload encodes a single item but 1 byte(s) remain after it.

      Version: viem@x.y.z]
    `)
  })

  test('after empty list', () => {
    // `0xc0` is the empty list `[]`; trailing `00` is junk.
    expect(() => fromRlp('0xc000', 'hex')).toThrowErrorMatchingInlineSnapshot(`
      [BaseError: Unexpected trailing bytes: RLP payload encodes a single item but 1 byte(s) remain after it.

      Version: viem@x.y.z]
    `)
  })

  test('valid single items still decode', () => {
    // No trailing bytes: these must keep working.
    expect(fromRlp('0x80', 'hex')).toEqual('0x')
    expect(fromRlp('0xc0', 'hex')).toEqual([])
    expect(fromRlp('0xc1c0', 'hex')).toEqual([[]])
    expect(fromRlp('0x83646f67', 'hex')).toEqual('0x646f67')
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
