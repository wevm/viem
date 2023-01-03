import { expect, test } from 'vitest'

import { keccak256 } from './keccak256'

test('to hex', () => {
  expect(
    keccak256(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    ),
  ).toMatchInlineSnapshot(
    '"0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0"',
  )
})

test('to bytes', () => {
  expect(
    keccak256(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
      { to: 'bytes' },
    ),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      62,
      162,
      241,
      208,
      171,
      243,
      252,
      102,
      207,
      41,
      238,
      187,
      112,
      203,
      212,
      231,
      254,
      118,
      46,
      248,
      160,
      155,
      204,
      6,
      200,
      237,
      246,
      65,
      35,
      10,
      254,
      192,
    ]
  `,
  )
})
