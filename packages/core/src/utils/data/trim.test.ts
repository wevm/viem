import { describe, expect, test } from 'vitest'

import { trim, trimBytes, trimHex } from './trim'

test('default', () => {
  expect(
    trim('0x00000000000000000000000000000000000000000000000000000000a4e12a45'),
  ).toMatchInlineSnapshot('"0xa4e12a45"')

  expect(
    trim(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 1, 122, 51, 123,
      ]),
    ),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      1,
      122,
      51,
      123,
    ]
  `,
  )
})

describe('hex', () => {
  test('default', () => {
    expect(
      trimHex(
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ),
    ).toMatchInlineSnapshot('"0x1"')

    expect(
      trimHex(
        '0x00000000000000000000000000000000000000000000000000000000a4e12a45',
      ),
    ).toMatchInlineSnapshot('"0xa4e12a45"')

    expect(
      trimHex(
        '0x00000000000000000000000000000000000000000000000000000001a4e12a45',
      ),
    ).toMatchInlineSnapshot('"0x1a4e12a45"')
  })

  test('args: dir', () => {
    expect(
      trimHex(
        '0x1000000000000000000000000000000000000000000000000000000000000000',
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot('"0x10"')

    expect(
      trimHex(
        '0xa4e12a4500000000000000000000000000000000000000000000000000000000',
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot('"0xa4e12a45"')

    expect(
      trimHex(
        '0x1a4e12a450000000000000000000000000000000000000000000000000000000',
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot('"0x1a4e12a450"')
  })
})

describe('bytes', () => {
  test('default', () => {
    expect(
      trimBytes(
        new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1,
        ]),
      ),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        1,
      ]
    `,
    )

    expect(
      trimBytes(
        new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 122, 51, 123,
        ]),
      ),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        1,
        122,
        51,
        123,
      ]
    `,
    )
  })

  test('args: dir', () => {
    expect(
      trimBytes(
        new Uint8Array([
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]),
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        1,
      ]
    `,
    )

    expect(
      trimBytes(
        new Uint8Array([
          1, 122, 51, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]),
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        1,
        122,
        51,
        123,
      ]
    `,
    )

    expect(
      trimBytes(
        new Uint8Array([
          1, 122, 51, 123, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]),
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        1,
        122,
        51,
        123,
        11,
      ]
    `,
    )
  })
})
