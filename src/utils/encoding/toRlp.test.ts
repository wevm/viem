import { describe, expect, test } from 'vitest'

import {
  boolToBytes,
  hexToBytes,
  numberToBytes,
  stringToBytes,
} from './toBytes.js'
import { boolToHex, bytesToHex, numberToHex, stringToHex } from './toHex.js'
import { bytesToRlp, hexToRlp, toRlp } from './toRlp.js'

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

test('no bytes', () => {
  // bytes -> bytes
  expect(bytesToRlp(hexToBytes('0x'))).toEqual(hexToBytes('0x80'))
  // bytes -> hex
  expect(toRlp(hexToBytes('0x'), 'hex')).toEqual('0x80')
  // hex -> hex
  expect(hexToRlp('0x')).toEqual('0x80')
  // hex -> bytes
  expect(toRlp('0x', 'bytes')).toEqual(hexToBytes('0x80'))
})

describe('prefix < 0x80', () => {
  test('bytes -> bytes', () => {
    expect(bytesToRlp(hexToBytes('0x00'))).toEqual(hexToBytes('0x00'))
    expect(bytesToRlp(hexToBytes('0x01'))).toEqual(hexToBytes('0x01'))
    expect(bytesToRlp(hexToBytes('0x42'))).toEqual(hexToBytes('0x42'))
    expect(bytesToRlp(hexToBytes('0x7f'))).toEqual(hexToBytes('0x7f'))

    expect(bytesToRlp(stringToBytes('!'))).toEqual(hexToBytes('0x21'))
    expect(bytesToRlp(stringToBytes('a'))).toEqual(hexToBytes('0x61'))
    expect(bytesToRlp(stringToBytes('~'))).toEqual(hexToBytes('0x7e'))

    expect(bytesToRlp(boolToBytes(true))).toEqual(hexToBytes('0x01'))
    expect(bytesToRlp(boolToBytes(false))).toEqual(hexToBytes('0x00'))

    expect(bytesToRlp(numberToBytes(0))).toEqual(hexToBytes('0x00'))
    expect(bytesToRlp(numberToBytes(69))).toEqual(hexToBytes('0x45'))
    expect(bytesToRlp(numberToBytes(127))).toEqual(hexToBytes('0x7f'))
  })

  test('bytes -> hex', () => {
    expect(toRlp(hexToBytes('0x00'), 'hex')).toEqual('0x00')
    expect(toRlp(hexToBytes('0x01'), 'hex')).toEqual('0x01')
    expect(toRlp(hexToBytes('0x42'), 'hex')).toEqual('0x42')
    expect(toRlp(hexToBytes('0x7f'), 'hex')).toEqual('0x7f')

    expect(toRlp(stringToBytes('!'), 'hex')).toEqual('0x21')
    expect(toRlp(stringToBytes('a'), 'hex')).toEqual('0x61')
    expect(toRlp(stringToBytes('~'), 'hex')).toEqual('0x7e')

    expect(toRlp(boolToBytes(true), 'hex')).toEqual('0x01')
    expect(toRlp(boolToBytes(false), 'hex')).toEqual('0x00')

    expect(toRlp(numberToBytes(0), 'hex')).toEqual('0x00')
    expect(toRlp(numberToBytes(69), 'hex')).toEqual('0x45')
    expect(toRlp(numberToBytes(127), 'hex')).toEqual('0x7f')
  })

  test('hex -> hex', () => {
    expect(hexToRlp('0x00')).toEqual('0x00')
    expect(hexToRlp('0x01')).toEqual('0x01')
    expect(hexToRlp('0x42')).toEqual('0x42')
    expect(hexToRlp('0x7f')).toEqual('0x7f')

    expect(hexToRlp(stringToHex('!'))).toEqual('0x21')
    expect(hexToRlp(stringToHex('a'))).toEqual('0x61')
    expect(hexToRlp(stringToHex('~'))).toEqual('0x7e')

    expect(hexToRlp(boolToHex(true))).toEqual('0x01')
    expect(hexToRlp(boolToHex(false))).toEqual('0x00')

    expect(hexToRlp(numberToHex(0))).toEqual('0x00')
    expect(hexToRlp(numberToHex(69))).toEqual('0x45')
    expect(hexToRlp(numberToHex(127))).toEqual('0x7f')
  })

  test('hex -> bytes', () => {
    expect(toRlp('0x00', 'bytes')).toEqual(hexToBytes('0x00'))
    expect(toRlp('0x01', 'bytes')).toEqual(hexToBytes('0x01'))
    expect(toRlp('0x42', 'bytes')).toEqual(hexToBytes('0x42'))
    expect(toRlp('0x7f', 'bytes')).toEqual(hexToBytes('0x7f'))

    expect(toRlp(stringToHex('!'), 'bytes')).toEqual(hexToBytes('0x21'))
    expect(toRlp(stringToHex('a'), 'bytes')).toEqual(hexToBytes('0x61'))
    expect(toRlp(stringToHex('~'), 'bytes')).toEqual(hexToBytes('0x7e'))

    expect(toRlp(boolToHex(true), 'bytes')).toEqual(hexToBytes('0x01'))
    expect(toRlp(boolToHex(false), 'bytes')).toEqual(hexToBytes('0x00'))

    expect(toRlp(numberToHex(0), 'bytes')).toEqual(hexToBytes('0x00'))
    expect(toRlp(numberToHex(69), 'bytes')).toEqual(hexToBytes('0x45'))
    expect(toRlp(numberToHex(127), 'bytes')).toEqual(hexToBytes('0x7f'))
  })
})

describe('prefix < 0xb7 (single byte)', () => {
  test('bytes -> bytes', () => {
    expect(bytesToRlp(hexToBytes('0x80'))).toEqual(hexToBytes('0x8180'))
    expect(bytesToRlp(hexToBytes('0xa4'))).toEqual(hexToBytes('0x81a4'))
    expect(bytesToRlp(hexToBytes('0xff'))).toEqual(hexToBytes('0x81ff'))

    expect(bytesToRlp(numberToBytes(128))).toEqual(hexToBytes('0x8180'))
    expect(bytesToRlp(numberToBytes(255))).toEqual(hexToBytes('0x81ff'))
  })

  test('bytes -> hex', () => {
    expect(toRlp(hexToBytes('0x80'), 'hex')).toEqual('0x8180')
    expect(toRlp(hexToBytes('0xa4'), 'hex')).toEqual('0x81a4')
    expect(toRlp(hexToBytes('0xff'), 'hex')).toEqual('0x81ff')

    expect(toRlp(numberToBytes(128), 'hex')).toEqual('0x8180')
    expect(toRlp(numberToBytes(255), 'hex')).toEqual('0x81ff')
  })

  test('hex -> hex', () => {
    expect(hexToRlp('0x80', 'hex')).toEqual('0x8180')
    expect(hexToRlp('0xa4', 'hex')).toEqual('0x81a4')
    expect(hexToRlp('0xff', 'hex')).toEqual('0x81ff')

    expect(hexToRlp(numberToHex(128), 'hex')).toEqual('0x8180')
    expect(hexToRlp(numberToHex(255), 'hex')).toEqual('0x81ff')
  })

  test('hex -> bytes', () => {
    expect(toRlp('0x80', 'bytes')).toEqual(hexToBytes('0x8180'))
    expect(toRlp('0xa4', 'bytes')).toEqual(hexToBytes('0x81a4'))
    expect(toRlp('0xff', 'bytes')).toEqual(hexToBytes('0x81ff'))

    expect(toRlp(numberToHex(128), 'bytes')).toEqual(hexToBytes('0x8180'))
    expect(toRlp(numberToHex(255), 'bytes')).toEqual(hexToBytes('0x81ff'))
  })
})

describe('prefix < 0xb7', () => {
  test('bytes -> bytes', () => {
    expect(bytesToRlp(generateBytes(2))).toEqual(
      Uint8Array.from([130, ...generateBytes(2)]),
    )
    expect(bytesToRlp(generateBytes(55))).toEqual(
      Uint8Array.from([183, ...generateBytes(55)]),
    )
  })

  test('bytes -> hex', () => {
    expect(toRlp(generateBytes(2), 'hex')).toEqual(
      bytesToHex(Uint8Array.from([130, ...generateBytes(2)])),
    )
    expect(toRlp(generateBytes(55), 'hex')).toEqual(
      bytesToHex(Uint8Array.from([183, ...generateBytes(55)])),
    )
  })

  test('hex -> hex', () => {
    expect(hexToRlp(bytesToHex(generateBytes(2)))).toEqual(
      bytesToHex(Uint8Array.from([130, ...generateBytes(2)])),
    )
    expect(hexToRlp(bytesToHex(generateBytes(55)))).toEqual(
      bytesToHex(Uint8Array.from([183, ...generateBytes(55)])),
    )
  })

  test('hex -> bytes', () => {
    expect(toRlp(bytesToHex(generateBytes(2)), 'bytes')).toEqual(
      Uint8Array.from([130, ...generateBytes(2)]),
    )
    expect(toRlp(bytesToHex(generateBytes(55)), 'bytes')).toEqual(
      Uint8Array.from([183, ...generateBytes(55)]),
    )
  })
})

describe('prefix === 0xb8', () => {
  test('bytes -> bytes', () => {
    expect(bytesToRlp(generateBytes(56))).toEqual(
      Uint8Array.from([184, 56, ...generateBytes(56)]),
    )
    expect(bytesToRlp(generateBytes(255))).toEqual(
      Uint8Array.from([184, 255, ...generateBytes(255)]),
    )
  })
})

describe('prefix === 0xb9', () => {
  test('bytes -> bytes', () => {
    expect(bytesToRlp(generateBytes(256))).toEqual(
      Uint8Array.from([185, 1, 0, ...generateBytes(256)]),
    )
    expect(bytesToRlp(generateBytes(65_535))).toEqual(
      Uint8Array.from([185, 255, 255, ...generateBytes(65_535)]),
    )
  })
})

describe('prefix === 0xba', () => {
  test('bytes -> bytes', () => {
    const bytes_1 = generateBytes(65_536)
    expect(bytesToRlp(bytes_1)).toEqual(
      Uint8Array.from([186, 1, 0, 0, ...bytes_1]),
    )

    const bytes_2 = generateBytes(16_777_215)
    expect(bytesToRlp(bytes_2)).toEqual(
      Uint8Array.from([186, 255, 255, 255, ...bytes_2]),
    )
  })
})

describe('prefix === 0xbb', () => {
  test('bytes -> bytes', () => {
    const bytes_1 = generateBytes(16_777_216)
    expect(bytesToRlp(bytes_1)).toEqual(
      Uint8Array.from([187, 1, 0, 0, 0, ...bytes_1]),
    )
  })
})

describe('list', () => {
  test('no bytes', () => {
    // bytes -> bytes
    expect(bytesToHex(bytesToRlp([]))).toMatchInlineSnapshot('"0xc0"')
    // bytes -> hex
    expect(toRlp([], 'hex')).toMatchInlineSnapshot('"0xc0"')
    // hex -> hex
    expect(hexToRlp([])).toMatchInlineSnapshot('"0xc0"')
    // hex -> bytes
    expect(bytesToHex(hexToRlp([], 'bytes'))).toMatchInlineSnapshot('"0xc0"')
  })

  test('inner no bytes', () => {
    // bytes -> bytes
    expect(bytesToHex(bytesToRlp([[]]))).toMatchInlineSnapshot('"0xc1c0"')
    // bytes -> hex
    expect(toRlp([[]], 'hex')).toMatchInlineSnapshot('"0xc1c0"')
    // hex -> hex
    expect(hexToRlp([[]])).toMatchInlineSnapshot('"0xc1c0"')
    // hex -> bytes
    expect(bytesToHex(hexToRlp([[]], 'bytes'))).toMatchInlineSnapshot(
      '"0xc1c0"',
    )
  })

  describe('prefix < 0xf8', () => {
    test('bytes -> bytes', () => {
      expect(
        bytesToHex(bytesToRlp([hexToBytes('0x00')])),
      ).toMatchInlineSnapshot('"0xc100"')
      expect(
        bytesToHex(bytesToRlp([hexToBytes('0x80')])),
      ).toMatchInlineSnapshot('"0xc28180"')
      expect(bytesToHex(bytesToRlp(generateList(14)))).toMatchInlineSnapshot(
        '"0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304"',
      )
      expect(
        bytesToHex(
          bytesToRlp([
            generateList(4),
            [generateList(8), [generateList(3), generateBytes(1)]],
          ]),
        ),
      ).toMatchInlineSnapshot(
        '"0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100"',
      )
    })

    test('bytes -> hex', () => {
      expect(toRlp([hexToBytes('0x00')], 'hex')).toMatchInlineSnapshot(
        '"0xc100"',
      )
      expect(toRlp([hexToBytes('0x80')], 'hex')).toMatchInlineSnapshot(
        '"0xc28180"',
      )
      expect(toRlp(generateList(14), 'hex')).toMatchInlineSnapshot(
        '"0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304"',
      )
      expect(
        toRlp(
          [
            generateList(4),
            [generateList(8), [generateList(3), generateBytes(1)]],
          ],
          'hex',
        ),
      ).toMatchInlineSnapshot(
        '"0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100"',
      )
    })

    test('hex -> hex', () => {
      expect(hexToRlp(['0x00'])).toMatchInlineSnapshot('"0xc100"')
      expect(hexToRlp(['0x80'])).toMatchInlineSnapshot('"0xc28180"')
      expect(
        hexToRlp(generateList(14).map((x) => bytesToHex(x))),
      ).toMatchInlineSnapshot(
        '"0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304"',
      )
      expect(
        hexToRlp([
          generateList(4).map((x) => bytesToHex(x)),
          [
            generateList(8).map((x) => bytesToHex(x)),
            [
              generateList(3).map((x) => bytesToHex(x)),
              bytesToHex(generateBytes(1)),
            ],
          ],
        ]),
      ).toMatchInlineSnapshot(
        '"0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100"',
      )
    })

    test('hex -> bytes', () => {
      expect(bytesToHex(toRlp(['0x00'], 'bytes'))).toMatchInlineSnapshot(
        '"0xc100"',
      )
      expect(bytesToHex(toRlp(['0x80'], 'bytes'))).toMatchInlineSnapshot(
        '"0xc28180"',
      )
      expect(
        bytesToHex(
          toRlp(
            generateList(14).map((x) => bytesToHex(x)),
            'bytes',
          ),
        ),
      ).toMatchInlineSnapshot(
        '"0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304"',
      )
      expect(
        bytesToHex(
          toRlp(
            [
              generateList(4).map((x) => bytesToHex(x)),
              [
                generateList(8).map((x) => bytesToHex(x)),
                [
                  generateList(3).map((x) => bytesToHex(x)),
                  bytesToHex(generateBytes(1)),
                ],
              ],
            ],
            'bytes',
          ),
        ),
      ).toMatchInlineSnapshot(
        '"0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100"',
      )
    })
  })

  test('prefix === 0xf8', () => {
    expect(bytesToHex(bytesToRlp(generateList(15)))).toMatchInlineSnapshot(
      '"0xf83e8000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405"',
    )
    expect(bytesToHex(bytesToRlp(generateList(60)))).toMatchInlineSnapshot(
      '"0xf8fe8000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102"',
    )
    expect(
      bytesToHex(
        bytesToRlp([
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
    expect(bytesToHex(bytesToRlp(generateList(61)))).toMatchInlineSnapshot(
      '"0xf9010380008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203"',
    )
    expect(bytesToHex(bytesToRlp(generateList(12_000)))).toMatchSnapshot()
  })

  test('prefix === 0xfa', () => {
    expect(bytesToHex(bytesToRlp(generateList(60_000)))).toMatchSnapshot()
  })

  // This test works, but it's really slow (understandably).
  test.skip('prefix === 0xfb', () => {
    expect(bytesToHex(bytesToRlp(generateList(10_000_000)))).toMatchSnapshot()
  })
})
