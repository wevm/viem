import type { Hex } from 'viem'
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

test('edge cases', () => {
  const values = [
    '0x',
    '0x0',
    '0x00',
    '0x0001',
    '0x00100',
    '0x1000',
    '0x10',
    '000100' as Hex,
    new Uint8Array([]),
    new Uint8Array([0]),
    new Uint8Array([0, 0, 1, 0, 0]),
    new Uint8Array([1, 0, 0]),
  ] as const

  expect(
    values.map((value) => [trim(value), trim(value, { dir: 'right' })]),
  ).toMatchInlineSnapshot(`
    [
      [
        "0x",
        "0x",
      ],
      [
        "0x00",
        "0x00",
      ],
      [
        "0x00",
        "0x00",
      ],
      [
        "0x01",
        "0x0001",
      ],
      [
        "0x0100",
        "0x0001",
      ],
      [
        "0x1000",
        "0x10",
      ],
      [
        "0x10",
        "0x10",
      ],
      [
        "0x0100",
        "0x0001",
      ],
      [
        Uint8Array [],
        Uint8Array [],
      ],
      [
        Uint8Array [
          0,
        ],
        Uint8Array [
          0,
        ],
      ],
      [
        Uint8Array [
          1,
          0,
          0,
        ],
        Uint8Array [
          0,
          0,
          1,
        ],
      ],
      [
        Uint8Array [
          1,
          0,
          0,
        ],
        Uint8Array [
          1,
        ],
      ],
    ]
  `)
})
