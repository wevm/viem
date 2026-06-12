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
})
