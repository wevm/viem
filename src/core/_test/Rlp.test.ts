import { describe, expect, test } from 'vitest'

import * as Bytes from '../Bytes.js'
import * as Hex from '../Hex.js'
import * as Rlp from '../Rlp.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = i
  return bytes
}

const generateList = (length: number) => {
  const bytes: Uint8Array[] = []
  for (let i = 0; i < length; i++) bytes.push(generateBytes(i % 8))
  return bytes
}

describe('from', () => {
  test('no bytes', () => {
    // bytes -> hex
    expect(Rlp.from(Bytes.fromHex('0x'), { as: 'Hex' })).toEqual('0x80')
    // hex -> bytes
    expect(Rlp.from('0x', { as: 'Bytes' })).toEqual(Bytes.fromHex('0x80'))
  })

  describe('prefix < 0x80', () => {
    test('bytes -> hex', () => {
      expect(Rlp.from(Bytes.fromHex('0x00'), { as: 'Hex' })).toEqual('0x00')
      expect(Rlp.from(Bytes.fromHex('0x01'), { as: 'Hex' })).toEqual('0x01')
      expect(Rlp.from(Bytes.fromHex('0x42'), { as: 'Hex' })).toEqual('0x42')
      expect(Rlp.from(Bytes.fromHex('0x7f'), { as: 'Hex' })).toEqual('0x7f')

      expect(Rlp.from(Bytes.fromString('!'), { as: 'Hex' })).toEqual('0x21')
      expect(Rlp.from(Bytes.fromString('a'), { as: 'Hex' })).toEqual('0x61')
      expect(Rlp.from(Bytes.fromString('~'), { as: 'Hex' })).toEqual('0x7e')

      expect(Rlp.from(Bytes.fromBoolean(true), { as: 'Hex' })).toEqual('0x01')
      expect(Rlp.from(Bytes.fromBoolean(false), { as: 'Hex' })).toEqual('0x00')

      expect(Rlp.from(Bytes.fromNumber(0), { as: 'Hex' })).toEqual('0x00')
      expect(Rlp.from(Bytes.fromNumber(69), { as: 'Hex' })).toEqual('0x45')
      expect(Rlp.from(Bytes.fromNumber(127), { as: 'Hex' })).toEqual('0x7f')
    })

    test('hex -> bytes', () => {
      expect(Rlp.from('0x00', { as: 'Bytes' })).toEqual(Bytes.fromHex('0x00'))
      expect(Rlp.from('0x01', { as: 'Bytes' })).toEqual(Bytes.fromHex('0x01'))
      expect(Rlp.from('0x42', { as: 'Bytes' })).toEqual(Bytes.fromHex('0x42'))
      expect(Rlp.from('0x7f', { as: 'Bytes' })).toEqual(Bytes.fromHex('0x7f'))

      expect(Rlp.from(Hex.fromString('!'), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x21'),
      )
      expect(Rlp.from(Hex.fromString('a'), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x61'),
      )
      expect(Rlp.from(Hex.fromString('~'), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x7e'),
      )

      expect(Rlp.from(Hex.fromBoolean(true), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x01'),
      )
      expect(Rlp.from(Hex.fromBoolean(false), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x00'),
      )

      expect(Rlp.from(Hex.fromNumber(0), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x00'),
      )
      expect(Rlp.from(Hex.fromNumber(69), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x45'),
      )
      expect(Rlp.from(Hex.fromNumber(127), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x7f'),
      )
    })
  })

  describe('prefix < 0xb7 (single byte)', () => {
    test('bytes -> hex', () => {
      expect(Rlp.from(Bytes.fromHex('0x80'), { as: 'Hex' })).toEqual('0x8180')
      expect(Rlp.from(Bytes.fromHex('0xa4'), { as: 'Hex' })).toEqual('0x81a4')
      expect(Rlp.from(Bytes.fromHex('0xff'), { as: 'Hex' })).toEqual('0x81ff')

      expect(Rlp.from(Bytes.fromNumber(128), { as: 'Hex' })).toEqual('0x8180')
      expect(Rlp.from(Bytes.fromNumber(255), { as: 'Hex' })).toEqual('0x81ff')
    })

    test('hex -> bytes', () => {
      expect(Rlp.from('0x80', { as: 'Bytes' })).toEqual(Bytes.fromHex('0x8180'))
      expect(Rlp.from('0xa4', { as: 'Bytes' })).toEqual(Bytes.fromHex('0x81a4'))
      expect(Rlp.from('0xff', { as: 'Bytes' })).toEqual(Bytes.fromHex('0x81ff'))

      expect(Rlp.from(Hex.fromNumber(128), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x8180'),
      )
      expect(Rlp.from(Hex.fromNumber(255), { as: 'Bytes' })).toEqual(
        Bytes.fromHex('0x81ff'),
      )
    })
  })

  describe('prefix < 0xb7', () => {
    test('bytes -> hex', () => {
      expect(Rlp.from(generateBytes(2), { as: 'Hex' })).toEqual(
        Hex.fromBytes(Uint8Array.from([130, ...generateBytes(2)])),
      )
      expect(Rlp.from(generateBytes(55), { as: 'Hex' })).toEqual(
        Hex.fromBytes(Uint8Array.from([183, ...generateBytes(55)])),
      )
    })

    test('hex -> bytes', () => {
      expect(
        Rlp.from(Hex.fromBytes(generateBytes(2)), { as: 'Bytes' }),
      ).toEqual(Uint8Array.from([130, ...generateBytes(2)]))
      expect(
        Rlp.from(Hex.fromBytes(generateBytes(55)), { as: 'Bytes' }),
      ).toEqual(Uint8Array.from([183, ...generateBytes(55)]))
    })
  })

  describe('list', () => {
    test('no bytes', () => {
      // bytes -> hex
      expect(Rlp.from([], { as: 'Hex' })).toMatchInlineSnapshot('"0xc0"')
      // hex -> bytes
      expect(
        Hex.fromBytes(Rlp.from([], { as: 'Bytes' })),
      ).toMatchInlineSnapshot('"0xc0"')
    })

    test('inner no bytes', () => {
      // bytes -> hex
      expect(Rlp.from([[]], { as: 'Hex' })).toMatchInlineSnapshot('"0xc1c0"')
      // hex -> bytes
      expect(
        Hex.fromBytes(Rlp.from([[]], { as: 'Bytes' })),
      ).toMatchInlineSnapshot('"0xc1c0"')
    })

    describe('prefix < 0xf8', () => {
      test('bytes -> hex', () => {
        expect(
          Rlp.from([Bytes.fromHex('0x00')], { as: 'Hex' }),
        ).toMatchInlineSnapshot('"0xc100"')
        expect(
          Rlp.from([Bytes.fromHex('0x80')], { as: 'Hex' }),
        ).toMatchInlineSnapshot('"0xc28180"')
        expect(Rlp.from(generateList(14), { as: 'Hex' })).toMatchInlineSnapshot(
          '"0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304"',
        )
        expect(
          Rlp.from(
            [
              generateList(4),
              [generateList(8), [generateList(3), generateBytes(1)]],
            ],
            { as: 'Hex' },
          ),
        ).toMatchInlineSnapshot(
          '"0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100"',
        )
      })

      test('hex -> bytes', () => {
        expect(
          Hex.fromBytes(Rlp.from(['0x00'], { as: 'Bytes' })),
        ).toMatchInlineSnapshot('"0xc100"')
        expect(
          Hex.fromBytes(Rlp.from(['0x80'], { as: 'Bytes' })),
        ).toMatchInlineSnapshot('"0xc28180"')
        expect(
          Hex.fromBytes(
            Rlp.from(
              generateList(14).map((x) => Hex.fromBytes(x)),
              { as: 'Bytes' },
            ),
          ),
        ).toMatchInlineSnapshot(
          '"0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304"',
        )
        expect(
          Hex.fromBytes(
            Rlp.from(
              [
                generateList(4).map((x) => Hex.fromBytes(x)),
                [
                  generateList(8).map((x) => Hex.fromBytes(x)),
                  [
                    generateList(3).map((x) => Hex.fromBytes(x)),
                    Hex.fromBytes(generateBytes(1)),
                  ],
                ],
              ],
              { as: 'Bytes' },
            ),
          ),
        ).toMatchInlineSnapshot(
          '"0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100"',
        )
      })
    })
  })
})

describe('fromBytes', () => {
  test('no bytes', () => {
    expect(Rlp.fromBytes(Bytes.fromHex('0x'))).toEqual(Bytes.fromHex('0x80'))
  })

  test('prefix < 0x80', () => {
    expect(Rlp.fromBytes(Bytes.fromHex('0x00'))).toEqual(Bytes.fromHex('0x00'))
    expect(Rlp.fromBytes(Bytes.fromHex('0x01'))).toEqual(Bytes.fromHex('0x01'))
    expect(Rlp.fromBytes(Bytes.fromHex('0x42'))).toEqual(Bytes.fromHex('0x42'))
    expect(Rlp.fromBytes(Bytes.fromHex('0x7f'))).toEqual(Bytes.fromHex('0x7f'))

    expect(Rlp.fromBytes(Bytes.fromString('!'))).toEqual(Bytes.fromHex('0x21'))
    expect(Rlp.fromBytes(Bytes.fromString('a'))).toEqual(Bytes.fromHex('0x61'))
    expect(Rlp.fromBytes(Bytes.fromString('~'))).toEqual(Bytes.fromHex('0x7e'))

    expect(Rlp.fromBytes(Bytes.fromBoolean(true))).toEqual(
      Bytes.fromHex('0x01'),
    )
    expect(Rlp.fromBytes(Bytes.fromBoolean(false))).toEqual(
      Bytes.fromHex('0x00'),
    )

    expect(Rlp.fromBytes(Bytes.fromNumber(0))).toEqual(Bytes.fromHex('0x00'))
    expect(Rlp.fromBytes(Bytes.fromNumber(69))).toEqual(Bytes.fromHex('0x45'))
    expect(Rlp.fromBytes(Bytes.fromNumber(127))).toEqual(Bytes.fromHex('0x7f'))
  })

  test('prefix < 0xb7 (single byte)', () => {
    expect(Rlp.fromBytes(Bytes.fromHex('0x80'))).toEqual(
      Bytes.fromHex('0x8180'),
    )
    expect(Rlp.fromBytes(Bytes.fromHex('0xa4'))).toEqual(
      Bytes.fromHex('0x81a4'),
    )
    expect(Rlp.fromBytes(Bytes.fromHex('0xff'))).toEqual(
      Bytes.fromHex('0x81ff'),
    )

    expect(Rlp.fromBytes(Bytes.fromNumber(128))).toEqual(
      Bytes.fromHex('0x8180'),
    )
    expect(Rlp.fromBytes(Bytes.fromNumber(255))).toEqual(
      Bytes.fromHex('0x81ff'),
    )
  })

  test('prefix < 0xb7', () => {
    expect(Rlp.fromBytes(generateBytes(2))).toEqual(
      Uint8Array.from([130, ...generateBytes(2)]),
    )
    expect(Rlp.fromBytes(generateBytes(55))).toEqual(
      Uint8Array.from([183, ...generateBytes(55)]),
    )
  })

  test('prefix === 0xb8', () => {
    expect(Rlp.fromBytes(generateBytes(56))).toEqual(
      Uint8Array.from([184, 56, ...generateBytes(56)]),
    )
    expect(Rlp.fromBytes(generateBytes(255))).toEqual(
      Uint8Array.from([184, 255, ...generateBytes(255)]),
    )
  })

  test('prefix === 0xb9', () => {
    expect(Rlp.fromBytes(generateBytes(256))).toEqual(
      Uint8Array.from([185, 1, 0, ...generateBytes(256)]),
    )
    expect(Rlp.fromBytes(generateBytes(65_535))).toEqual(
      Uint8Array.from([185, 255, 255, ...generateBytes(65_535)]),
    )
  })

  test('prefix === 0xba', () => {
    const bytes = generateBytes(65_536)
    expect(Rlp.fromBytes(bytes)).toEqual(
      Uint8Array.from([186, 1, 0, 0, ...bytes]),
    )
  })

  test('options: as (Hex)', () => {
    expect(Rlp.fromBytes(Bytes.fromHex('0x'), { as: 'Hex' })).toEqual('0x80')
    expect(Rlp.fromBytes(generateBytes(2), { as: 'Hex' })).toEqual(
      Hex.fromBytes(Uint8Array.from([130, ...generateBytes(2)])),
    )
  })

  describe('list', () => {
    test('no bytes', () => {
      expect(Hex.fromBytes(Rlp.fromBytes([]))).toMatchInlineSnapshot('"0xc0"')
    })

    test('inner no bytes', () => {
      expect(Hex.fromBytes(Rlp.fromBytes([[]]))).toMatchInlineSnapshot(
        '"0xc1c0"',
      )
    })

    test('prefix < 0xf8', () => {
      expect(
        Hex.fromBytes(Rlp.fromBytes([Bytes.fromHex('0x00')])),
      ).toMatchInlineSnapshot('"0xc100"')
      expect(
        Hex.fromBytes(Rlp.fromBytes([Bytes.fromHex('0x80')])),
      ).toMatchInlineSnapshot('"0xc28180"')
      expect(
        Hex.fromBytes(Rlp.fromBytes(generateList(14))),
      ).toMatchInlineSnapshot(
        '"0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304"',
      )
      expect(
        Hex.fromBytes(
          Rlp.fromBytes([
            generateList(4),
            [generateList(8), [generateList(3), generateBytes(1)]],
          ]),
        ),
      ).toMatchInlineSnapshot(
        '"0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100"',
      )
    })

    test('prefix === 0xf8', () => {
      expect(
        Hex.fromBytes(Rlp.fromBytes(generateList(15))),
      ).toMatchInlineSnapshot(
        '"0xf83e8000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405"',
      )
      expect(
        Hex.fromBytes(Rlp.fromBytes(generateList(60))),
      ).toMatchInlineSnapshot(
        '"0xf8fe8000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102"',
      )
      expect(
        Hex.fromBytes(
          Rlp.fromBytes([
            generateList(4),
            [generateList(8), [generateList(3), generateBytes(1)]],
            [
              generateList(10),
              [
                generateList(5),
                generateBytes(2),
                [generateList(10), [generateList(20)]],
              ],
            ],
          ]),
        ),
      ).toMatchInlineSnapshot(
        '"0xf8eec9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100f8b5e580008200018300010284000102038500010203048600010203040587000102030405068000f88dce8000820001830001028400010203820001f879e580008200018300010284000102038500010203048600010203040587000102030405068000f851f84f80008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102"',
      )
    })

    test('prefix === 0xf9', () => {
      expect(
        Hex.fromBytes(Rlp.fromBytes(generateList(61))),
      ).toMatchInlineSnapshot(
        '"0xf9010380008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203"',
      )
    })

    test('prefix === 0xfa', () => {
      const list = generateList(60_000)
      const rlp = Rlp.fromBytes(list)
      // 60_000 items in repeating 0..7-length groups -> 35 bytes per 8 items.
      const bodyLength = (60_000 / 8) * 35
      expect(rlp.length).toBe(1 + 3 + bodyLength)
      expect([rlp[0], rlp[1], rlp[2], rlp[3]]).toEqual([
        0xfa,
        (bodyLength >> 16) & 0xff,
        (bodyLength >> 8) & 0xff,
        bodyLength & 0xff,
      ])
      expect(Rlp.toBytes(rlp)).toEqual(list)
    })
  })
})

describe('fromHex', () => {
  test('no bytes', () => {
    expect(Rlp.fromHex('0x')).toEqual('0x80')
  })

  test('prefix < 0x80', () => {
    expect(Rlp.fromHex('0x00')).toEqual('0x00')
    expect(Rlp.fromHex('0x01')).toEqual('0x01')
    expect(Rlp.fromHex('0x42')).toEqual('0x42')
    expect(Rlp.fromHex('0x7f')).toEqual('0x7f')

    expect(Rlp.fromHex(Hex.fromString('!'))).toEqual('0x21')
    expect(Rlp.fromHex(Hex.fromString('a'))).toEqual('0x61')
    expect(Rlp.fromHex(Hex.fromString('~'))).toEqual('0x7e')

    expect(Rlp.fromHex(Hex.fromBoolean(true))).toEqual('0x01')
    expect(Rlp.fromHex(Hex.fromBoolean(false))).toEqual('0x00')

    expect(Rlp.fromHex(Hex.fromNumber(0))).toEqual('0x00')
    expect(Rlp.fromHex(Hex.fromNumber(69))).toEqual('0x45')
    expect(Rlp.fromHex(Hex.fromNumber(127))).toEqual('0x7f')
  })

  test('prefix < 0xb7 (single byte)', () => {
    expect(Rlp.fromHex('0x80')).toEqual('0x8180')
    expect(Rlp.fromHex('0xa4')).toEqual('0x81a4')
    expect(Rlp.fromHex('0xff')).toEqual('0x81ff')

    expect(Rlp.fromHex(Hex.fromNumber(128))).toEqual('0x8180')
    expect(Rlp.fromHex(Hex.fromNumber(255))).toEqual('0x81ff')
  })

  test('prefix < 0xb7', () => {
    expect(Rlp.fromHex(Hex.fromBytes(generateBytes(2)))).toEqual(
      Hex.fromBytes(Uint8Array.from([130, ...generateBytes(2)])),
    )
    expect(Rlp.fromHex(Hex.fromBytes(generateBytes(55)))).toEqual(
      Hex.fromBytes(Uint8Array.from([183, ...generateBytes(55)])),
    )
  })

  describe('list', () => {
    test('no bytes', () => {
      // hex -> hex
      expect(Rlp.fromHex([])).toMatchInlineSnapshot('"0xc0"')
      // hex -> bytes
      expect(
        Hex.fromBytes(Rlp.fromHex([], { as: 'Bytes' })),
      ).toMatchInlineSnapshot('"0xc0"')
    })

    test('inner no bytes', () => {
      // hex -> hex
      expect(Rlp.fromHex([[]])).toMatchInlineSnapshot('"0xc1c0"')
      // hex -> bytes
      expect(
        Hex.fromBytes(Rlp.fromHex([[]], { as: 'Bytes' })),
      ).toMatchInlineSnapshot('"0xc1c0"')
    })

    test('prefix < 0xf8', () => {
      expect(Rlp.fromHex(['0x00'])).toMatchInlineSnapshot('"0xc100"')
      expect(Rlp.fromHex(['0x80'])).toMatchInlineSnapshot('"0xc28180"')
      expect(
        Rlp.fromHex(generateList(14).map((x) => Hex.fromBytes(x))),
      ).toMatchInlineSnapshot(
        '"0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304"',
      )
      expect(
        Rlp.fromHex([
          generateList(4).map((x) => Hex.fromBytes(x)),
          [
            generateList(8).map((x) => Hex.fromBytes(x)),
            [
              generateList(3).map((x) => Hex.fromBytes(x)),
              Hex.fromBytes(generateBytes(1)),
            ],
          ],
        ]),
      ).toMatchInlineSnapshot(
        '"0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100"',
      )
    })
  })
})

describe('toBytes', () => {
  test('no bytes', () => {
    expect(Rlp.toBytes('0x')).toStrictEqual(new Uint8Array([]))
  })

  describe('list', () => {
    test('no bytes', () => {
      expect(Rlp.toBytes('0xc0')).toEqual([])
    })

    test('inner no bytes', () => {
      expect(Rlp.toBytes('0xc1c0')).toEqual([[]])
    })
  })
})

describe('toHex', () => {
  test('no bytes', () => {
    expect(Rlp.toHex('0x')).toEqual('0x')
  })

  describe('list', () => {
    test('no bytes', () => {
      expect(Rlp.toHex(Uint8Array.from([0xc0]))).toEqual([])
    })

    test('inner no bytes', () => {
      expect(Rlp.toHex(Uint8Array.from([0xc1, 0xc0]))).toEqual([[]])
    })
  })
})
