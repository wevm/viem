import { expect, test } from 'vitest'

import { ripemd160 } from './ripemd160.js'

test('to hex', () => {
  expect(ripemd160('0xdeadbeef')).toMatchInlineSnapshot(
    `"0x226821c2f5423e11fe9af68bd285c249db2e4b5a"`,
  )

  expect(
    ripemd160(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    ),
  ).toMatchInlineSnapshot(`"0x8476ee4631b9b30ac2754b0ee0c47e161d3f724c"`)
})

test('to bytes', () => {
  expect(ripemd160('0xdeadbeef', 'bytes')).toMatchInlineSnapshot(
    `
    Uint8Array [
      34,
      104,
      33,
      194,
      245,
      66,
      62,
      17,
      254,
      154,
      246,
      139,
      210,
      133,
      194,
      73,
      219,
      46,
      75,
      90,
    ]
  `,
  )

  expect(
    ripemd160(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
      'bytes',
    ),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      132,
      118,
      238,
      70,
      49,
      185,
      179,
      10,
      194,
      117,
      75,
      14,
      224,
      196,
      126,
      22,
      29,
      63,
      114,
      76,
    ]
  `,
  )
})
