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
