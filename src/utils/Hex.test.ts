import { describe, expect, test } from 'vitest'

import * as Hex from './Hex.js'

describe('concat', () => {
  test('default', () => {
    expect(Hex.concat('0x0', '0x1')).toBe('0x01')
    expect(Hex.concat('0x1', '0x69', '0x420')).toBe('0x169420')
    expect(Hex.concat('0x00000001', '0x00000069', '0x00000420')).toBe(
      '0x000000010000006900000420',
    )
  })
})

describe('fromBoolean', () => {
  test('default', () => {
    expect(Hex.fromBoolean(true)).toMatchInlineSnapshot('"0x1"')
    expect(Hex.fromBoolean(false)).toMatchInlineSnapshot('"0x0"')
  })

  test('args: size', () => {
    expect(Hex.fromBoolean(true, { size: 16 })).toMatchInlineSnapshot(
      '"0x00000000000000000000000000000001"',
    )
    expect(Hex.fromBoolean(true, { size: 32 })).toMatchInlineSnapshot(
      '"0x0000000000000000000000000000000000000000000000000000000000000001"',
    )
    expect(Hex.fromBoolean(false, { size: 16 })).toMatchInlineSnapshot(
      '"0x00000000000000000000000000000000"',
    )
    expect(Hex.fromBoolean(false, { size: 32 })).toMatchInlineSnapshot(
      '"0x0000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      Hex.fromBoolean(true, { size: 0 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`0\` bytes. Given size: \`1\` bytes.]`,
    )
    expect(() =>
      Hex.fromBoolean(false, { size: 0 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`0\` bytes. Given size: \`1\` bytes.]`,
    )
  })
})

describe('fromBytes', () => {
  test('default', () => {
    expect(Hex.fromBytes(new Uint8Array([]))).toMatchInlineSnapshot('"0x"')
    expect(Hex.fromBytes(new Uint8Array([97]))).toMatchInlineSnapshot('"0x61"')
    expect(Hex.fromBytes(new Uint8Array([97, 98, 99]))).toMatchInlineSnapshot(
      '"0x616263"',
    )
    expect(
      Hex.fromBytes(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
      ),
    ).toMatchInlineSnapshot('"0x48656c6c6f20576f726c6421"')
  })

  test('args: size', () => {
    expect(
      Hex.fromBytes(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
        { size: 16 },
      ),
    ).toMatchInlineSnapshot('"0x48656c6c6f20576f726c642100000000"')
    expect(
      Hex.fromBytes(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
        { size: 32 },
      ),
    ).toMatchInlineSnapshot(
      '"0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"',
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      Hex.fromBytes(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
        { size: 8 },
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`8\` bytes. Given size: \`12\` bytes.]`,
    )
  })
})

describe('fromNumber', () => {
  describe('number', () => {
    test('default', () => {
      expect(Hex.fromNumber(0)).toMatchInlineSnapshot('"0x0"')
      expect(Hex.fromNumber(7)).toMatchInlineSnapshot('"0x7"')
      expect(Hex.fromNumber(69)).toMatchInlineSnapshot('"0x45"')
      expect(Hex.fromNumber(420)).toMatchInlineSnapshot('"0x1a4"')

      expect(() =>
        // oxlint-disable-next-line no-loss-of-precision -- intentionally out-of-range
        Hex.fromNumber(420182738912731283712937129),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`4.2018273891273126e+26\` is not in safe unsigned integer range (\`0\` to \`9007199254740991\`)]`,
      )
      expect(() => Hex.fromNumber(-69)).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`-69\` is not in safe unsigned integer range (\`0\` to \`9007199254740991\`)]`,
      )
    })

    test('args: size', () => {
      expect(Hex.fromNumber(7, { size: 1 })).toBe('0x07')
      expect(Hex.fromNumber(10, { size: 2 })).toBe('0x000a')
      expect(Hex.fromNumber(69, { size: 4 })).toBe('0x00000045')
      expect(Hex.fromNumber(69, { size: 32 })).toBe(
        '0x0000000000000000000000000000000000000000000000000000000000000045',
      )

      expect(() =>
        Hex.fromNumber(-7, { size: 1 }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`-7\` is not in safe 8-bit unsigned integer range (\`0\` to \`255\`)]`,
      )
      expect(() =>
        Hex.fromNumber(256, { size: 1 }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`256\` is not in safe 8-bit unsigned integer range (\`0\` to \`255\`)]`,
      )
      expect(() =>
        Hex.fromNumber(65536, { size: 2 }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`65536\` is not in safe 16-bit unsigned integer range (\`0\` to \`65535\`)]`,
      )
    })

    test('args: signed', () => {
      expect(Hex.fromNumber(32, { size: 1, signed: true })).toBe('0x20')
      expect(
        Hex.fromNumber(-32, {
          size: 1,
          signed: true,
        }),
      ).toBe('0xe0')
      expect(
        Hex.fromNumber(-32, {
          size: 4,
          signed: true,
        }),
      ).toBe('0xffffffe0')

      expect(Hex.fromNumber(127, { size: 2, signed: true })).toBe('0x007f')
      expect(Hex.fromNumber(-127, { size: 2, signed: true })).toBe('0xff81')
      expect(Hex.fromNumber(32767, { size: 2, signed: true })).toBe('0x7fff')
      expect(Hex.fromNumber(-32768, { size: 2, signed: true })).toBe('0x8000')
      expect(() =>
        Hex.fromNumber(32768, { size: 2, signed: true }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`32768\` is not in safe 16-bit signed integer range (\`-32768\` to \`32767\`)]`,
      )
      expect(() =>
        Hex.fromNumber(-32769, { size: 2, signed: true }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`-32769\` is not in safe 16-bit signed integer range (\`-32768\` to \`32767\`)]`,
      )
    })
  })

  describe('bigint', () => {
    test('default', () => {
      expect(Hex.fromNumber(0n)).toMatchInlineSnapshot('"0x0"')
      expect(Hex.fromNumber(7n)).toMatchInlineSnapshot('"0x7"')
      expect(Hex.fromNumber(69n)).toMatchInlineSnapshot('"0x45"')
      expect(Hex.fromNumber(420n)).toMatchInlineSnapshot('"0x1a4"')
      expect(
        Hex.fromNumber(4206942069420694206942069420694206942069n),
      ).toMatchInlineSnapshot('"0xc5cf39211876fb5e5884327fa56fc0b75"')

      expect(() => Hex.fromNumber(-69n)).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`-69n\` is not in safe unsigned integer range (above \`0n\`)]`,
      )
    })

    test('args: size', () => {
      expect(Hex.fromNumber(7n, { size: 1 })).toBe('0x07')
      expect(Hex.fromNumber(10n, { size: 2 })).toBe('0x000a')
      expect(Hex.fromNumber(69n, { size: 4 })).toBe('0x00000045')
      expect(Hex.fromNumber(6123123124124124213123129n, { size: 32 })).toBe(
        '0x00000000000000000000000000000000000000000005109f2b700e30e5b39839',
      )

      expect(() =>
        Hex.fromNumber(-7n, { size: 1 }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`-7n\` is not in safe 8-bit unsigned integer range (\`0n\` to \`255n\`)]`,
      )
      expect(() =>
        Hex.fromNumber(256n, { size: 1 }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`256n\` is not in safe 8-bit unsigned integer range (\`0n\` to \`255n\`)]`,
      )
      expect(() =>
        Hex.fromNumber(65536n, { size: 2 }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`65536n\` is not in safe 16-bit unsigned integer range (\`0n\` to \`65535n\`)]`,
      )
      expect(() =>
        Hex.fromNumber(18446744073709551616n, { size: 8 }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`18446744073709551616n\` is not in safe 64-bit unsigned integer range (\`0n\` to \`18446744073709551615n\`)]`,
      )
    })

    test('args: signed', () => {
      expect(Hex.fromNumber(32n, { size: 1, signed: true })).toBe('0x20')
      expect(
        Hex.fromNumber(-32n, {
          size: 1,
          signed: true,
        }),
      ).toBe('0xe0')
      expect(
        Hex.fromNumber(-32n, {
          size: 4,
          signed: true,
        }),
      ).toBe('0xffffffe0')

      expect(Hex.fromNumber(127n, { size: 2, signed: true })).toBe('0x007f')
      expect(Hex.fromNumber(-127n, { size: 2, signed: true })).toBe('0xff81')
      expect(Hex.fromNumber(32767n, { size: 2, signed: true })).toBe('0x7fff')
      expect(Hex.fromNumber(-32768n, { size: 2, signed: true })).toBe('0x8000')

      expect(
        Hex.fromNumber(12312312312312312412n, { size: 32, signed: true }),
      ).toBe(
        '0x000000000000000000000000000000000000000000000000aade1ed08b0b325c',
      )
      expect(
        Hex.fromNumber(-12312312312312312412n, { size: 32, signed: true }),
      ).toBe(
        '0xffffffffffffffffffffffffffffffffffffffffffffffff5521e12f74f4cda4',
      )

      expect(() =>
        Hex.fromNumber(170141183460469231731687303715884105728n, {
          size: 16,
          signed: true,
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`170141183460469231731687303715884105728n\` is not in safe 128-bit signed integer range (\`-170141183460469231731687303715884105728n\` to \`170141183460469231731687303715884105727n\`)]`,
      )
      expect(() =>
        Hex.fromNumber(-170141183460469231731687303715884105729n, {
          size: 16,
          signed: true,
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Hex.IntegerOutOfRangeError: Number \`-170141183460469231731687303715884105729n\` is not in safe 128-bit signed integer range (\`-170141183460469231731687303715884105728n\` to \`170141183460469231731687303715884105727n\`)]`,
      )
    })
  })
})

describe('fromString', () => {
  test('default', () => {
    expect(Hex.fromString('')).toMatchInlineSnapshot('"0x"')
    expect(Hex.fromString('a')).toMatchInlineSnapshot('"0x61"')
    expect(Hex.fromString('abc')).toMatchInlineSnapshot('"0x616263"')
    expect(Hex.fromString('Hello World!')).toMatchInlineSnapshot(
      '"0x48656c6c6f20576f726c6421"',
    )
  })

  test('args: size', () => {
    expect(Hex.fromString('Hello World!', { size: 16 })).toMatchInlineSnapshot(
      '"0x48656c6c6f20576f726c642100000000"',
    )
    expect(Hex.fromString('Hello World!', { size: 32 })).toMatchInlineSnapshot(
      '"0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"',
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      Hex.fromString('Hello World!', { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`8\` bytes. Given size: \`12\` bytes.]`,
    )
  })
})

describe('padLeft', () => {
  test('default', () => {
    expect(Hex.padLeft('0x1')).toMatchInlineSnapshot(
      '"0x0000000000000000000000000000000000000000000000000000000000000001"',
    )

    expect(Hex.padLeft('0xa4e12a45')).toMatchInlineSnapshot(
      '"0x00000000000000000000000000000000000000000000000000000000a4e12a45"',
    )

    expect(Hex.padLeft('0x1a4e12a45')).toMatchInlineSnapshot(
      '"0x00000000000000000000000000000000000000000000000000000001a4e12a45"',
    )

    expect(() =>
      Hex.padLeft(
        '0x1a4e12a45a21323123aaa87a897a897a898a6567a578a867a98778a667a85a875a87a6a787a65a675a6a9',
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeExceedsPaddingSizeError: Hex size (\`43\`) exceeds padding size (\`32\`).]`,
    )
  })

  test('args: size', () => {
    expect(Hex.padLeft('0x1', 4)).toMatchInlineSnapshot('"0x00000001"')

    expect(Hex.padLeft('0xa4e12a45', 4)).toMatchInlineSnapshot('"0xa4e12a45"')

    expect(Hex.padLeft('0xa4e12a45ab', 0)).toMatchInlineSnapshot(
      '"0xa4e12a45ab"',
    )

    expect(() =>
      Hex.padLeft('0x1a4e12a45', 4),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeExceedsPaddingSizeError: Hex size (\`5\`) exceeds padding size (\`4\`).]`,
    )
  })
})

describe('padRight', () => {
  test('default', () => {
    expect(Hex.padRight('0x1')).toMatchInlineSnapshot(
      '"0x1000000000000000000000000000000000000000000000000000000000000000"',
    )

    expect(Hex.padRight('0xa4e12a45')).toMatchInlineSnapshot(
      '"0xa4e12a4500000000000000000000000000000000000000000000000000000000"',
    )

    expect(Hex.padRight('0x1a4e12a45')).toMatchInlineSnapshot(
      '"0x1a4e12a450000000000000000000000000000000000000000000000000000000"',
    )
  })
})

describe('size', () => {
  test('default', () => {
    expect(Hex.size('0x')).toBe(0)
    expect(Hex.size('0x1')).toBe(1)
    expect(Hex.size('0x12')).toBe(1)
    expect(Hex.size('0x1234')).toBe(2)
    expect(Hex.size('0x12345678')).toBe(4)
  })
})

describe('slice', () => {
  test('default', () => {
    expect(Hex.slice('0x')).toMatchInlineSnapshot('"0x"')
    expect(Hex.slice('0x0123456789')).toMatchInlineSnapshot('"0x0123456789"')

    expect(Hex.slice('0x', 0)).toMatchInlineSnapshot('"0x"')
    expect(Hex.slice('0x0123456789', 0, 4)).toMatchInlineSnapshot(
      '"0x01234567"',
    )
    expect(Hex.slice('0x0123456789', 1, 4)).toMatchInlineSnapshot('"0x234567"')
    expect(Hex.slice('0x0123456789', 2, 5)).toMatchInlineSnapshot('"0x456789"')
    expect(Hex.slice('0x0123456789', 2)).toMatchInlineSnapshot('"0x456789"')
    expect(
      Hex.slice(
        '0x0000000000000000000000000000000000000000000000000000000000010f2c000000000000000000000000000000000000000000000000000000000000a45500000000000000000000000000000000000000000000000000000000190f1b44',
        33,
        65,
      ),
    ).toBe('0x0000000000000000000000000000000000000000000000000000000000a45500')

    expect(Hex.slice('0x0123456789', -1)).toMatchInlineSnapshot('"0x89"')
    expect(Hex.slice('0x0123456789', -3, -1)).toMatchInlineSnapshot('"0x4567"')
    expect(Hex.slice('0x0123456789', -5)).toMatchInlineSnapshot(
      '"0x0123456789"',
    )

    expect(Hex.slice('0x0123456789', 0, 10)).toMatchInlineSnapshot(
      '"0x0123456789"',
    )
    expect(Hex.slice('0x0123456789', -10)).toMatchInlineSnapshot(
      '"0x0123456789"',
    )

    expect(() =>
      Hex.slice('0x0123456789', 5),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SliceOffsetOutOfBoundsError: Slice starting at offset \`5\` is out-of-bounds (size: \`5\`).]`,
    )

    expect(() =>
      Hex.slice('0x0123456789', 0, 6, { strict: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SliceOffsetOutOfBoundsError: Slice ending at offset \`6\` is out-of-bounds (size: \`5\`).]`,
    )
    expect(() =>
      Hex.slice('0x0123456789', 0, 10, { strict: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SliceOffsetOutOfBoundsError: Slice ending at offset \`10\` is out-of-bounds (size: \`5\`).]`,
    )
  })
})

describe('toBigInt', () => {
  test('default', () => {
    expect(Hex.toBigInt('0x0')).toMatchInlineSnapshot('0n')
    expect(Hex.toBigInt('0x7')).toMatchInlineSnapshot('7n')
    expect(Hex.toBigInt('0x45')).toMatchInlineSnapshot('69n')
    expect(Hex.toBigInt('0x1a4')).toMatchInlineSnapshot('420n')
    expect(
      Hex.toBigInt('0xc5cf39211876fb5e5884327fa56fc0b75'),
    ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')
  })

  test('args: signed', () => {
    expect(Hex.toBigInt('0x20', { signed: true })).toBe(32n)
    expect(
      Hex.toBigInt('0xe0', {
        signed: true,
      }),
    ).toBe(-32n)

    expect(Hex.toBigInt('0x007f', { signed: true })).toBe(127n)
    expect(Hex.toBigInt('0xff81', { signed: true })).toBe(-127n)
    expect(Hex.toBigInt('0x7fff', { signed: true })).toBe(32767n)
    expect(Hex.toBigInt('0x8000', { signed: true })).toBe(-32768n)

    expect(
      Hex.toBigInt(
        '0x000000000000000000000000000000000000000000000000aade1ed08b0b325c',
        { signed: true },
      ),
    ).toBe(12312312312312312412n)
    expect(
      Hex.toBigInt(
        '0xffffffffffffffffffffffffffffffffffffffffffffffff5521e12f74f4cda4',
        { signed: true },
      ),
    ).toBe(-12312312312312312412n)
  })

  test('args: size', () => {
    expect(
      Hex.toBigInt(Hex.fromNumber(69420n, { size: 32 }), { size: 32 }),
    ).toEqual(69420n)
  })

  test('error: size overflow', () => {
    expect(() =>
      Hex.toBigInt(Hex.fromNumber(69420, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })
})

describe('toBoolean', () => {
  test('default', () => {
    expect(Hex.toBoolean('0x0')).toMatchInlineSnapshot('false')
    expect(Hex.toBoolean('0x1')).toMatchInlineSnapshot('true')
  })

  test('args: size', () => {
    expect(
      Hex.toBoolean(Hex.fromBoolean(true, { size: 32 }), { size: 32 }),
    ).toEqual(true)
  })

  test('error: size overflow', () => {
    expect(() =>
      Hex.toBoolean(Hex.fromBoolean(true, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })

  test('error: invalid boolean', () => {
    expect(() => Hex.toBoolean('0xa')).toThrowErrorMatchingInlineSnapshot(`
      [Hex.InvalidHexBooleanError: Hex value \`"0xa"\` is not a valid boolean.

      The hex value must be \`"0x0"\` (false) or \`"0x1"\` (true).]
    `)
  })
})

describe('toBytes', () => {
  test('default', () => {
    expect(Hex.toBytes('0x')).toMatchInlineSnapshot('Uint8Array []')
    expect(Hex.toBytes('0x61')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
      ]
    `)
    expect(Hex.toBytes('0x616263')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
        98,
        99,
      ]
    `)
    expect(Hex.toBytes('0x48656c6c6f20576f726c6421')).toMatchInlineSnapshot(`
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
      ]
    `)
  })

  test('args: size', () => {
    expect(
      Hex.toBytes(Hex.fromBytes(Uint8Array.from([69, 420]), { size: 32 }), {
        size: 32,
      }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        69,
        164,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]
    `)
  })

  test('error: size overflow', () => {
    expect(() =>
      Hex.toBytes(Hex.fromBytes(Uint8Array.from([69, 420]), { size: 64 }), {
        size: 32,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })

  test('error: invalid bytes', () => {
    expect(() => Hex.toBytes('0x420fggf11a'))
      .toThrowErrorMatchingInlineSnapshot(`
      [Hex.InvalidHexValueError: Value \`0x420fggf11a\` is an invalid hex value.

      Hex values must start with \`"0x"\` and contain only hexadecimal characters (0-9, a-f, A-F).]
    `)
  })
})

describe('toNumber', () => {
  test('default', () => {
    expect(Hex.toNumber('0x0')).toMatchInlineSnapshot('0')
    expect(Hex.toNumber('0x7')).toMatchInlineSnapshot('7')
    expect(Hex.toNumber('0x45')).toMatchInlineSnapshot('69')
    expect(Hex.toNumber('0x1a4')).toMatchInlineSnapshot('420')
  })

  test('args: signed', () => {
    expect(Hex.toNumber('0x20', { signed: true })).toBe(32)
    expect(
      Hex.toNumber('0xe0', {
        signed: true,
      }),
    ).toBe(-32)
    expect(
      Hex.toNumber('0xffffffe0', {
        signed: true,
      }),
    ).toBe(-32)

    expect(Hex.toNumber('0x007f', { signed: true })).toBe(127)
    expect(Hex.toNumber('0xff81', { signed: true })).toBe(-127)
    expect(Hex.toNumber('0x7fff', { signed: true })).toBe(32767)
    expect(Hex.toNumber('0x8000', { signed: true })).toBe(-32768)

    expect(Hex.toNumber('0xffff', { signed: true })).toBe(-1)
    expect(Hex.toNumber('0x4961769b', { signed: true })).toBe(1231124123)
    expect(Hex.toNumber('0x00027760a62ec2ac', { signed: true })).toBe(
      694206942069420,
    )
  })

  test('args: size', () => {
    expect(
      Hex.toNumber(Hex.fromNumber(69420, { size: 32 }), { size: 32 }),
    ).toEqual(69420)
  })

  test('error: size overflow', () => {
    expect(() =>
      Hex.toNumber(Hex.fromNumber(69420, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })

  test('error: integer out of range', () => {
    expect(() =>
      Hex.toNumber('0x20000000000000'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`9007199254740992\` is not in safe unsigned integer range (\`0\` to \`9007199254740991\`)]`,
    )
    expect(() =>
      Hex.toNumber('0xffdfffffffffffff', { signed: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`-9007199254740992\` is not in safe signed integer range (\`-9007199254740991\` to \`9007199254740991\`)]`,
    )
  })
})

describe('toString', () => {
  test('default', () => {
    expect(Hex.toString('0x')).toMatchInlineSnapshot(`""`)
    expect(Hex.toString('0x61')).toMatchInlineSnapshot(`"a"`)
    expect(Hex.toString('0x616263')).toMatchInlineSnapshot(`"abc"`)
    expect(Hex.toString('0x48656c6c6f20576f726c6421')).toMatchInlineSnapshot(
      `"Hello World!"`,
    )
  })

  test('args: size', () => {
    expect(
      Hex.toString(Hex.fromString('wagmi', { size: 32 }), { size: 32 }),
    ).toEqual('wagmi')
  })

  test('error: size overflow', () => {
    expect(() =>
      Hex.toString(Hex.fromString('wagmi', { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })
})

describe('trimLeft', () => {
  test('default', () => {
    expect(Hex.trimLeft('0x000000')).toMatchInlineSnapshot('"0x"')

    expect(Hex.trimLeft('0x1')).toMatchInlineSnapshot('"0x1"')
    expect(Hex.trimLeft('0x01')).toMatchInlineSnapshot('"0x1"')
    expect(Hex.trimLeft('0x001')).toMatchInlineSnapshot('"0x1"')
    expect(Hex.trimLeft('0x0001')).toMatchInlineSnapshot('"0x1"')

    expect(
      Hex.trimLeft(
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ),
    ).toMatchInlineSnapshot('"0x1"')

    expect(
      Hex.trimLeft(
        '0x00000000000000000000000000000000000000000000000000000000a4e12a45',
      ),
    ).toMatchInlineSnapshot('"0xa4e12a45"')

    expect(
      Hex.trimLeft(
        '0x00000000000000000000000000000000000000000000000000000001a4e12a45',
      ),
    ).toMatchInlineSnapshot('"0x1a4e12a45"')

    expect(Hex.trimLeft('0x00012340')).toMatchInlineSnapshot('"0x12340"')
    expect(Hex.trimLeft('0x00102340')).toMatchInlineSnapshot('"0x102340"')
  })
})

describe('trimRight', () => {
  test('default', () => {
    expect(
      Hex.trimRight(
        '0x1000000000000000000000000000000000000000000000000000000000000000',
      ),
    ).toMatchInlineSnapshot('"0x10"')

    expect(
      Hex.trimRight(
        '0xa4e12a4500000000000000000000000000000000000000000000000000000000',
      ),
    ).toMatchInlineSnapshot('"0xa4e12a45"')

    expect(
      Hex.trimRight(
        '0x1a4e12a450000000000000000000000000000000000000000000000000000000',
      ),
    ).toMatchInlineSnapshot('"0x1a4e12a450"')
  })
})

describe('validate', () => {
  test('default', () => {
    expect(Hex.validate('0x')).toBeTruthy()
    expect(Hex.validate('0x0')).toBeTruthy()
    expect(Hex.validate('0x0123456789abcdef')).toBeTruthy()
    expect(Hex.validate('0x0123456789abcdefABCDEF')).toBeTruthy()
    expect(Hex.validate('0x0123456789abcdefg')).toBeTruthy()
    expect(Hex.validate('0x0123456789abcdefg', { strict: true })).toBeFalsy()
    expect(Hex.validate('0x0123456789abcdefg', { strict: false })).toBeTruthy()
    expect(Hex.validate({ foo: 'bar' })).toBeFalsy()
    expect(Hex.validate(undefined)).toBeFalsy()
  })
})
