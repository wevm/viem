import { describe, expect, test } from 'vitest'

import { trim } from './trim.js'

test('default', () => {
  expect(trim('0x000000')).toMatchInlineSnapshot('"0x00"')
  expect(trim(new Uint8Array([0, 0, 0, 0, 0]))).toMatchInlineSnapshot(
    `
    Uint8Array [
      0,
    ]
  `,
  )

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
    expect(trim('0x1')).toMatchInlineSnapshot('"0x01"')
    expect(trim('0x01')).toMatchInlineSnapshot('"0x01"')
    expect(trim('0x001')).toMatchInlineSnapshot('"0x01"')
    expect(trim('0x0001')).toMatchInlineSnapshot('"0x01"')

    expect(
      trim(
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ),
    ).toMatchInlineSnapshot('"0x01"')

    expect(
      trim(
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ),
    ).toMatchInlineSnapshot('"0x01"')

    expect(
      trim(
        '0x00000000000000000000000000000000000000000000000000000000a4e12a45',
      ),
    ).toMatchInlineSnapshot('"0xa4e12a45"')

    expect(
      trim(
        '0x00000000000000000000000000000000000000000000000000000001a4e12a45',
      ),
    ).toMatchInlineSnapshot('"0x01a4e12a45"')

    expect(trim('0x00012340')).toMatchInlineSnapshot('"0x012340"')
    expect(trim('0x00102340')).toMatchInlineSnapshot('"0x102340"')
  })

  test('args: dir', () => {
    expect(
      trim(
        '0x1000000000000000000000000000000000000000000000000000000000000000',
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot('"0x10"')

    expect(
      trim(
        '0xa4e12a4500000000000000000000000000000000000000000000000000000000',
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot('"0xa4e12a45"')

    expect(
      trim(
        '0x1a4e12a450000000000000000000000000000000000000000000000000000000',
        { dir: 'right' },
      ),
    ).toMatchInlineSnapshot('"0x01a4e12a45"')
  })
})

describe('bytes', () => {
  test('default', () => {
    expect(
      trim(
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
      trim(
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
      trim(
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
      trim(
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
      trim(
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
