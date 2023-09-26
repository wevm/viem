import { describe, expect, test } from 'vitest'

import { fromRlp, rlpToBytes, rlpToHex } from './fromRlp.js'
import { hexToBytes, toBytes } from './toBytes.js'
import { bytesToRlp } from './toRlp.js'

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
  expect(rlpToBytes(hexToBytes('0x'))).toStrictEqual(new Uint8Array([]))
  // bytes -> hex
  expect(rlpToHex('0x')).toEqual('0x')
  // hex -> bytes
  expect(fromRlp('0x', 'bytes')).toStrictEqual(new Uint8Array([]))
  // hex -> hex
  expect(fromRlp('0x')).toEqual('0x')
})

describe('prefix < 0x80', () => {
  test('bytes -> bytes', () => {
    expect(rlpToBytes(hexToBytes('0x00'))).toStrictEqual(new Uint8Array([0]))
    expect(rlpToBytes(hexToBytes('0x01'))).toStrictEqual(new Uint8Array([1]))

    expect(rlpToBytes(hexToBytes('0x21'))).toEqual(toBytes('!'))
    expect(rlpToBytes(hexToBytes('0x61'))).toEqual(toBytes('a'))
    expect(rlpToBytes(hexToBytes('0x7e'))).toEqual(toBytes('~'))

    expect(rlpToBytes(hexToBytes('0x01'))).toEqual(toBytes(true))
    expect(rlpToBytes(hexToBytes('0x00'))).toEqual(toBytes(false))

    expect(rlpToBytes(hexToBytes('0x00'))).toEqual(toBytes(0))
    expect(rlpToBytes(hexToBytes('0x45'))).toEqual(toBytes(69))
    expect(rlpToBytes(hexToBytes('0x7f'))).toEqual(toBytes(127))
  })
})

describe('prefix < 0xb7 (single byte)', () => {
  test('bytes -> bytes', () => {
    expect(rlpToBytes(hexToBytes('0x8180'))).toEqual(hexToBytes('0x80'))
    expect(rlpToBytes(hexToBytes('0x81a4'))).toEqual(hexToBytes('0xa4'))
    expect(rlpToBytes(hexToBytes('0x81ff'))).toEqual(hexToBytes('0xff'))
  })
})

describe('prefix < 0xb7', () => {
  test('bytes -> bytes', () => {
    expect(rlpToBytes(Uint8Array.from([0x82, ...generateBytes(2)]))).toEqual(
      generateBytes(2),
    )
    expect(rlpToBytes(Uint8Array.from([0xb7, ...generateBytes(55)]))).toEqual(
      generateBytes(55),
    )
  })
})

describe('prefix === 0xb8', () => {
  test('bytes -> bytes', () => {
    expect(
      rlpToBytes(Uint8Array.from([0xb8, 56, ...generateBytes(56)])),
    ).toEqual(generateBytes(56))
    expect(
      rlpToBytes(Uint8Array.from([0xb8, 255, ...generateBytes(255)])),
    ).toEqual(generateBytes(255))
  })
})

describe('prefix === 0xb9', () => {
  test('bytes -> bytes', () => {
    expect(
      rlpToBytes(Uint8Array.from([0xb9, 1, 0, ...generateBytes(256)])),
    ).toEqual(generateBytes(256))
    expect(
      rlpToBytes(Uint8Array.from([0xb9, 255, 255, ...generateBytes(65_535)])),
    ).toEqual(generateBytes(65_535))
  })
})

describe('prefix === 0xba', () => {
  test('bytes -> bytes', () => {
    expect(
      rlpToBytes(Uint8Array.from([0xba, 1, 0, 0, ...generateBytes(65_536)])),
    ).toEqual(generateBytes(65_536))
    expect(
      rlpToBytes(
        Uint8Array.from([0xba, 255, 255, 255, ...generateBytes(16_777_215)]),
      ),
    ).toEqual(generateBytes(16_777_215))
  })
})

describe('prefix === 0xbb', () => {
  test('bytes -> bytes', () => {
    expect(
      rlpToBytes(
        Uint8Array.from([0xbb, 1, 0, 0, 0, ...generateBytes(16_777_216)]),
      ),
    ).toEqual(generateBytes(16_777_216))
  })
})

describe('list', () => {
  test('no bytes', () => {
    // bytes -> bytes
    expect(rlpToBytes(Uint8Array.from([0xc0]))).toEqual([])
    // bytes -> hex
    expect(fromRlp(Uint8Array.from([0xc0]), 'hex')).toEqual([])
    // hex -> hex
    expect(rlpToHex('0xc0')).toEqual([])
    // hex -> bytes
    expect(fromRlp('0xc0', 'bytes')).toEqual([])
  })

  test('inner no bytes', () => {
    // bytes -> bytes
    expect(rlpToBytes(Uint8Array.from([0xc1, 0xc0]))).toEqual([[]])
    // bytes -> hex
    expect(fromRlp(Uint8Array.from([0xc1, 0xc0]), 'hex')).toEqual([[]])
    // hex -> hex
    expect(rlpToHex('0xc1c0')).toEqual([[]])
    // hex -> bytes
    expect(fromRlp('0xc1c0', 'bytes')).toEqual([[]])
  })

  describe('prefix < 0xf8', () => {
    test('bytes -> bytes', () => {
      expect(rlpToBytes(hexToBytes('0xc100'))).toEqual([hexToBytes('0x00')])
      expect(rlpToBytes(hexToBytes('0xc28180'))).toEqual([hexToBytes('0x80')])
      expect(
        rlpToBytes(
          hexToBytes(
            '0xf780008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304',
          ),
        ),
      ).toEqual(generateList(14))
      expect(
        rlpToBytes(
          hexToBytes(
            '0xf7c9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100',
          ),
        ),
      ).toEqual([
        generateList(4),
        [generateList(8), [generateList(3), generateBytes(1)]],
      ])
    })
  })

  test('prefix === 0xf8', () => {
    expect(
      rlpToBytes(
        hexToBytes(
          '0xf83e8000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405',
        ),
      ),
    ).toEqual(generateList(15))
    expect(
      rlpToBytes(
        hexToBytes(
          '0xf8fe8000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102',
        ),
      ),
    ).toEqual(generateList(60))
    expect(
      rlpToBytes(
        hexToBytes(
          '0xf8eec9800082000183000102ece38000820001830001028400010203850001020304860001020304058700010203040506c7c5800082000100f8b5e580008200018300010284000102038500010203048600010203040587000102030405068000f88dce8000820001830001028400010203820001f879e580008200018300010284000102038500010203048600010203040587000102030405068000f851f84f80008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102',
        ),
      ),
    ).toEqual([
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
    ])
  })

  test('prefix === 0xf9', () => {
    expect(
      rlpToBytes(
        hexToBytes(
          '0xf9010380008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203850001020304860001020304058700010203040506800082000183000102840001020385000102030486000102030405870001020304050680008200018300010284000102038500010203048600010203040587000102030405068000820001830001028400010203',
        ),
      ),
    ).toEqual(generateList(61))
    expect(rlpToBytes(bytesToRlp(generateList(12_000)))).toEqual(
      generateList(12_000),
    )
  })

  test('prefix === 0xfa', () => {
    expect(rlpToBytes(bytesToRlp(generateList(60_000)))).toEqual(
      generateList(60_000),
    )
  })

  // This test works, but it's really slow (understandably).
  test.skip('prefix === 0xfb', () => {
    const list = generateList(10_000_000)
    expect(rlpToBytes(bytesToRlp(list))).toEqual(list)
  })
})
