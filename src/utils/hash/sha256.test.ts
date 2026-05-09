import { expect, test } from 'vitest'

import { sha256 } from './sha256.js'

test('to hex', () => {
  expect(sha256('0xdeadbeef')).toMatchInlineSnapshot(
    `"0x5f78c33274e43fa9de5659265c1d917e25c03722dcb0b8d27db8d5feaa813953"`,
  )

  expect(
    sha256(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    ),
  ).toMatchInlineSnapshot(
    `"0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"`,
  )
})

test('to bytes', () => {
  expect(sha256('0xdeadbeef', 'bytes')).toMatchInlineSnapshot(
    `
    Uint8Array [
      95,
      120,
      195,
      50,
      116,
      228,
      63,
      169,
      222,
      86,
      89,
      38,
      92,
      29,
      145,
      126,
      37,
      192,
      55,
      34,
      220,
      176,
      184,
      210,
      125,
      184,
      213,
      254,
      170,
      129,
      57,
      83,
    ]
  `,
  )

  expect(
    sha256(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
      'bytes',
    ),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      127,
      131,
      177,
      101,
      127,
      241,
      252,
      83,
      185,
      45,
      193,
      129,
      72,
      161,
      214,
      93,
      252,
      45,
      75,
      31,
      163,
      214,
      119,
      40,
      74,
      221,
      210,
      0,
      18,
      109,
      144,
      105,
    ]
  `,
  )
})
