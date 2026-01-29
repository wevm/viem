import { describe, expect, test } from 'vitest'

import { seaportContractConfig } from '~test/src/abis.js'
import { address } from '~test/src/constants.js'

import {
  maxInt128,
  maxInt256,
  maxUint128,
  maxUint256,
  minInt128,
  minInt256,
} from '../../constants/number.js'
import {
  encodeAbiParameters,
  getArrayComponents,
} from './encodeAbiParameters.js'
import { getAbiItem } from './getAbiItem.js'

describe('static', () => {
  test('blank', () => {
    expect(encodeAbiParameters([], [])).toBe('0x')
  })

  test('uint', () => {
    expect(
      encodeAbiParameters(
        [
          {
            type: 'uint256',
          },
        ],
        [69420n],
      ),
    ).toBe('0x0000000000000000000000000000000000000000000000000000000000010f2c')
  })

  describe('uint8', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint8',
            },
          ],
          [32],
        ),
      ).toBe(
        '0x0000000000000000000000000000000000000000000000000000000000000020',
      )
    })

    test('invalid value', () => {
      try {
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint8',
            },
          ],
          // @ts-expect-error
          [69420n],
        )
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint8',
            },
          ],
          // @ts-expect-error
          ['lol'],
        )
      } catch {}
    })
  })

  describe('uint32', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint32',
            },
          ],
          [69420],
        ),
      ).toBe(
        '0x0000000000000000000000000000000000000000000000000000000000010f2c',
      )
    })

    test('invalid value', () => {
      try {
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint32',
            },
          ],
          // @ts-expect-error
          [69420n],
        )
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint32',
            },
          ],
          // @ts-expect-error
          ['lol'],
        )
      } catch {}
    })
  })

  describe('int', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int256',
            },
          ],
          [69420n],
        ),
      ).toBe(
        '0x0000000000000000000000000000000000000000000000000000000000010f2c',
      )
    })

    test('negative (twos compliment)', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int256',
            },
          ],
          [-69420n],
        ),
      ).toBe(
        '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffef0d4',
      )
    })
  })

  describe('int8', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int8',
            },
          ],
          [127],
        ),
      ).toBe(
        '0x000000000000000000000000000000000000000000000000000000000000007f',
      )
    })

    test('negative (twos compliment)', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int8',
            },
          ],
          [-128],
        ),
      ).toBe(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80',
      )
    })

    test('invalid value', () => {
      try {
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int8',
            },
          ],
          // @ts-expect-error
          [69420n],
        )
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int8',
            },
          ],
          // @ts-expect-error
          ['lol'],
        )
      } catch {}
    })
  })

  describe('int32', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int32',
            },
          ],
          [2147483647],
        ),
      ).toBe(
        '0x000000000000000000000000000000000000000000000000000000007fffffff',
      )
    })

    test('negative (twos compliment)', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int32',
            },
          ],
          [-2147483648],
        ),
      ).toBe(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff80000000',
      )
    })

    test('invalid value', () => {
      try {
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int32',
            },
          ],
          // @ts-expect-error
          [69420n],
        )
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int32',
            },
          ],
          // @ts-expect-error
          ['lol'],
        )
      } catch {}
    })
  })

  describe('address', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'address',
            },
          ],
          ['0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'],
        ),
      ).toBe(
        '0x00000000000000000000000014dc79964da2c08b23698b3d3cc7ca32193d9955',
      )
    })
  })

  describe('bool', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bool',
            },
          ],
          [true],
        ),
      ).toBe(
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      )
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bool',
            },
          ],
          [false],
        ),
      ).toBe(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      )
    })
  })

  describe('bytes8', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes8',
            },
          ],
          ['0x0123456789abcdef'],
        ),
      ).toBe(
        '0x0123456789abcdef000000000000000000000000000000000000000000000000',
      )
    })

    test('overflow', () => {
      expect(() =>
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes8',
            },
          ],
          [
            '0x0000000000000000000000000000000000000000000000000000000000000000000000000123456789abcdef',
          ],
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `
        [AbiEncodingBytesSizeMismatchError: Size of bytes "0x0000000000000000000000000000000000000000000000000000000000000000000000000123456789abcdef" (bytes44) does not match expected size (bytes8).

        Version: viem@x.y.z]
      `,
      )
    })
  })

  describe('bytes16', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes16',
            },
          ],
          ['0x42069420694201023210101231415122'],
        ),
      ).toBe(
        '0x4206942069420102321010123141512200000000000000000000000000000000',
      )
    })

    test('overflow', () => {
      expect(() =>
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes16',
            },
          ],
          [
            '0x000000000000000000000000000000000000000000000000000000000000000420',
          ],
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `
        [AbiEncodingBytesSizeMismatchError: Size of bytes "0x000000000000000000000000000000000000000000000000000000000000000420" (bytes33) does not match expected size (bytes16).

        Version: viem@x.y.z]
      `,
      )
    })
  })

  describe('uint[3]', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[3]',
            },
          ],
          [[69420n, 42069n, 420420420n]],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000010f2c000000000000000000000000000000000000000000000000000000000000a45500000000000000000000000000000000000000000000000000000000190f1b44"',
      )
    })
  })

  describe('int[3]', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'int256[3]',
            },
          ],
          [[69420n, -42069n, 420420420n]],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000010f2cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff5bab00000000000000000000000000000000000000000000000000000000190f1b44"',
      )
    })
  })

  describe('address[2]', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'address[2]',
            },
          ],
          [
            [
              '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
              '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            ],
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac"',
      )
    })
  })

  describe('bool[2]', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bool[2]',
            },
          ],
          [[true, false]],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('bytes8[2]', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes8[2]',
            },
          ],
          [['0x1211121112111211', '0x1111111111111111']],
        ),
      ).toMatchInlineSnapshot(
        '"0x12111211121112110000000000000000000000000000000000000000000000001111111111111111000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('uint[3][2]', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[3][2]',
            },
          ],
          [
            [
              [69420n, 42069n, 420420420n],
              [420n, 44n, 422n],
            ],
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000010f2c000000000000000000000000000000000000000000000000000000000000a45500000000000000000000000000000000000000000000000000000000190f1b4400000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000001a6"',
      )
    })
  })

  describe('uint[3][2][4]', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[3][2][4]',
            },
          ],
          [
            [
              [
                [1n, 2n, 3n],
                [4n, 5n, 6n],
              ],
              [
                [7n, 8n, 9n],
                [10n, 11n, 12n],
              ],
              [
                [13n, 14n, 15n],
                [16n, 17n, 18n],
              ],
              [
                [19n, 20n, 21n],
                [22n, 23n, 24n],
              ],
            ],
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000009000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000d000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000110000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001300000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000015000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000018"',
      )
    })
  })

  describe('struct: (uint256,bool,address)', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a((uint256,bool,address))" "(420,true,0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC)"
        encodeAbiParameters(
          [
            {
              components: [
                {
                  name: 'x',
                  type: 'uint256',
                },
                {
                  name: 'y',
                  type: 'bool',
                },
                {
                  name: 'z',
                  type: 'address',
                },
              ],
              name: 'fooIn',
              type: 'tuple',
            },
          ],
          [
            {
              x: 420n,
              y: true,
              z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            },
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac"',
      )
    })
  })

  describe('struct: (uint256,bool,address)', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a((uint256,bool,address))" "(420,true,0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC)"
        encodeAbiParameters(
          [
            {
              components: [
                {
                  type: 'uint256',
                },
                {
                  type: 'bool',
                },
                {
                  type: 'address',
                },
              ],
              name: 'fooOut',
              type: 'tuple',
            },
          ],
          [[420n, true, '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac"',
      )
    })
  })

  describe('struct: ((uint256,bool,address),(uint256,bool,address),uint8[2])', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(((uint256,bool,address),(uint256,bool,address),uint8[2]))" "((420,true,0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC),(69,false,0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b),[1,2])"
        encodeAbiParameters(
          [
            {
              components: [
                {
                  components: [
                    {
                      name: 'x',
                      type: 'uint256',
                    },
                    {
                      name: 'y',
                      type: 'bool',
                    },
                    {
                      name: 'z',
                      type: 'address',
                    },
                  ],
                  name: 'foo',
                  type: 'tuple',
                },
                {
                  components: [
                    {
                      name: 'x',
                      type: 'uint256',
                    },
                    {
                      name: 'y',
                      type: 'bool',
                    },
                    {
                      name: 'z',
                      type: 'address',
                    },
                  ],
                  name: 'baz',
                  type: 'tuple',
                },
                {
                  name: 'x',
                  type: 'uint8[2]',
                },
              ],
              name: 'barIn',
              type: 'tuple',
            },
          ],
          [
            {
              foo: {
                x: 420n,
                y: true,
                z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              },
              baz: {
                x: 69n,
                y: false,
                z: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
              },
              x: [1, 2],
            },
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002"',
      )
    })
  })

  describe('struct: (uint8,bytes[])', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              components: [
                {
                  type: 'uint8',
                },
                {
                  type: 'bytes[]',
                },
              ],
              type: 'tuple',
            },
          ],
          [[69, ['0x123', '0x456']]],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002123000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024560000000000000000000000000000000000000000000000000000000000000"',
      )
    })

    test('empty bytes', () => {
      expect(
        encodeAbiParameters(
          [
            {
              components: [
                {
                  type: 'uint8',
                },
                {
                  type: 'bytes[]',
                },
              ],
              type: 'tuple',
            },
          ],
          [[0, []]],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(uint256[2],bool,string[])', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            { name: 'xOut', type: 'uint256[2]' },
            { name: 'yOut', type: 'bool' },
            { name: 'zOut', type: 'string[3]' },
          ],
          [[420n, 69n], true, ['wagmi', 'viem', 'lol']],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000057761676d6900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000047669656d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036c6f6c0000000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('multiple (uint,bool,address)', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256',
            },
            {
              name: 'yIn',
              type: 'bool',
            },
            {
              name: 'zIn',
              type: 'address',
            },
          ],
          [420n, true, '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b'],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b"',
      )
    })
  })

  describe('multiple params unnamed: (uint,bool,address)', () => {
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: '',
              type: 'uint256',
            },
            {
              name: '',
              type: 'bool',
            },
            {
              name: '',
              type: 'address',
            },
          ],
          [420n, true, '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b'],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b"',
      )
    })
  })
})

describe('dynamic', () => {
  describe('(string)', () => {
    // cast abi-encode "a(string)" "wagmi"
    test('default', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xOut',
              type: 'string',
            },
          ],
          ['wagmi'],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000"',
      )
    })

    // cast abi-encode "a(string)" "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc faucibus lorem a libero auctor condimentum. Donec ornare massa rhoncus lacus rutrum, eget pulvinar arcu elementum. Nunc mauris lorem, sodales eget viverra in, euismod quis mi. Praesent nec commodo leo. Phasellus condimentum mauris sed accumsan eleifend. Praesent ac blandit sem, et rutrum ipsum. Etiam in tellus ac enim facilisis ultrices. Fusce ac vestibulum quam. Duis sed purus scelerisque, sollicitudin erat ac, pulvinar nisi. Pellentesque eu purus nec sapien vehicula convallis ut vel elit. Suspendisse eget ex vitae enim volutpat scelerisque. Sed quis elit tristique erat luctus egestas a ac odio. Duis vehicula enim ac metus gravida, vel maximus nisi imperdiet."
    test('> 32 bytes', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xOut',
              type: 'string',
            },
          ],
          [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc faucibus lorem a libero auctor condimentum. Donec ornare massa rhoncus lacus rutrum, eget pulvinar arcu elementum. Nunc mauris lorem, sodales eget viverra in, euismod quis mi. Praesent nec commodo leo. Phasellus condimentum mauris sed accumsan eleifend. Praesent ac blandit sem, et rutrum ipsum. Etiam in tellus ac enim facilisis ultrices. Fusce ac vestibulum quam. Duis sed purus scelerisque, sollicitudin erat ac, pulvinar nisi. Pellentesque eu purus nec sapien vehicula convallis ut vel elit. Suspendisse eget ex vitae enim volutpat scelerisque. Sed quis elit tristique erat luctus egestas a ac odio. Duis vehicula enim ac metus gravida, vel maximus nisi imperdiet.',
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000002da4c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6e73656374657475722061646970697363696e6720656c69742e204e756e63206661756369627573206c6f72656d2061206c696265726f20617563746f7220636f6e64696d656e74756d2e20446f6e6563206f726e617265206d617373612072686f6e637573206c616375732072757472756d2c20656765742070756c76696e6172206172637520656c656d656e74756d2e204e756e63206d6175726973206c6f72656d2c20736f64616c65732065676574207669766572726120696e2c20657569736d6f642071756973206d692e205072616573656e74206e656320636f6d6d6f646f206c656f2e2050686173656c6c757320636f6e64696d656e74756d206d61757269732073656420616363756d73616e20656c656966656e642e205072616573656e7420616320626c616e6469742073656d2c2065742072757472756d20697073756d2e20457469616d20696e2074656c6c757320616320656e696d20666163696c6973697320756c7472696365732e20467573636520616320766573746962756c756d207175616d2e204475697320736564207075727573207363656c657269737175652c20736f6c6c696369747564696e20657261742061632c2070756c76696e6172206e6973692e2050656c6c656e746573717565206575207075727573206e65632073617069656e207665686963756c6120636f6e76616c6c69732075742076656c20656c69742e2053757370656e6469737365206567657420657820766974616520656e696d20766f6c7574706174207363656c657269737175652e20536564207175697320656c6974207472697374697175652065726174206c756374757320656765737461732061206163206f64696f2e2044756973207665686963756c6120656e696d206163206d6574757320677261766964612c2076656c206d6178696d7573206e69736920696d706572646965742e000000000000"',
      )
    })

    // cast abi-encode "a(string)" "👨‍👨‍👦‍👦🏴‍☠️"
    test('emojis', () => {
      expect(
        encodeAbiParameters(
          [
            {
              name: 'xOut',
              type: 'string',
            },
          ],
          ['👨‍👨‍👦‍👦🏴‍☠️'],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000026f09f91a8e2808df09f91a8e2808df09f91a6e2808df09f91a6f09f8fb4e2808de298a0efb88f0000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(string,uint,bool)', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(string,uint,bool)" "wagmi" 420 true
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'string',
            },
            {
              name: 'yIn',
              type: 'uint256',
            },
            {
              name: 'zIn',
              type: 'bool',
            },
          ],
          ['wagmi', 420n, true],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(uint[2],bool,string)', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(uint[2],bool,string)" "[420,69]" true "wagmi"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[2]',
            },
            {
              name: 'yIn',
              type: 'bool',
            },
            {
              name: 'zIn',
              type: 'string',
            },
          ],
          [[420n, 69n], true, 'wagmi'],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(bytes)', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(bytes)" "0x42069"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes',
            },
          ],
          ['0x042069'],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000030420690000000000000000000000000000000000000000000000000000000000"',
      )
      expect(
        // cast abi-encode "a(bytes)" "0xd83ddc68200dd83ddc68200dd83ddc66200dd83ddc66d83cdff4200d2620fe0f"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes',
            },
          ],
          [
            '0xd83ddc68200dd83ddc68200dd83ddc66200dd83ddc66d83cdff4200d2620fe0f',
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020d83ddc68200dd83ddc68200dd83ddc66200dd83ddc66d83cdff4200d2620fe0f"',
      )
      expect(
        // cast abi-encode "a(bytes)" "0x70a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes',
            },
          ],
          [
            '0x70a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002470a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000"',
      )
      expect(
        // cast abi-encode "a(bytes)" "0x70a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604570a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'bytes',
            },
          ],
          [
            '0x70a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604570a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004870a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604570a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000"',
      )
      expect(
        // cast abi-encode "a(bytes)" "0x"
        encodeAbiParameters([{ type: 'bytes' }], ['0x']),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(uint[])', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(uint[])" "[420,69,22,55]"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[]',
            },
          ],
          [[420n, 69n, 22n, 55n]],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000037"',
      )
    })

    test('empty', () => {
      expect(
        // cast abi-encode "a(uint[])" "[]"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[]',
            },
          ],
          [[]],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(uint[][])', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(uint[][])" "[[420,69]]"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[][]',
            },
          ],
          [[[420n, 69n]]],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000045"',
      )
    })

    test('empty', () => {
      expect(
        // cast abi-encode "a(uint[][])" "[[]]"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[][]',
            },
          ],
          [[[]]],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
      )
    })

    test('complex', () => {
      expect(
        // cast abi-encode "a(uint[][])" "[[420,69],[22,55,22],[51,52,66,11]]"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[][]',
            },
          ],
          [
            [
              [420n, 69n],
              [22n, 55n, 22n],
              [51n, 52n, 66n, 11n],
            ],
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000003700000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000003300000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000000b"',
      )
    })
  })

  describe('(uint[][][])', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(uint[][][])" "[[[420,69]]]"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'uint256[][][]',
            },
          ],
          [[[[420n, 69n]]]],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000045"',
      )
    })
  })

  describe('(string[2])', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(string[2])" "["wagmi","viem"]"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'string[2]',
            },
          ],
          [['wagmi', 'viem']],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000057761676d6900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000047669656d00000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(string[2][3])', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(string[2][3])" "[["wagmi","viem"],["jake","tom"],["lol","haha"]]"
        encodeAbiParameters(
          [
            {
              name: 'xIn',
              type: 'string[2][3]',
            },
          ],
          [
            [
              ['wagmi', 'viem'],
              ['jake', 'tom'],
              ['lol', 'haha'],
            ],
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000057761676d6900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000047669656d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000046a616b65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003746f6d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036c6f6c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046861686100000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('((uint256[],bool,string[]))', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a((uint256[],bool,string[]))" "([1,2,3,4],true,[hello,world])"
        encodeAbiParameters(
          [
            {
              components: [
                {
                  name: 'x',
                  type: 'uint256[]',
                },
                {
                  name: 'y',
                  type: 'bool',
                },
                {
                  name: 'z',
                  type: 'string[]',
                },
              ],
              name: 'bazIn',
              type: 'tuple',
            },
          ],
          [
            {
              x: [1n, 2n, 3n, 4n],
              y: true,
              z: ['hello', 'world'],
            },
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000568656c6c6f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005776f726c64000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(((uint256[],bool,string[])),uint256,string[])', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a(((uint256[],bool,string[]),uint256,string[]))" "(([1,2,3,4],true,[hello,world]),420,[wagmi,viem])"
        encodeAbiParameters(
          [
            {
              components: [
                {
                  components: [
                    {
                      name: 'x',
                      type: 'uint256[]',
                    },
                    {
                      name: 'y',
                      type: 'bool',
                    },
                    {
                      name: 'z',
                      type: 'string[]',
                    },
                  ],
                  name: 'foo',
                  type: 'tuple',
                },
                {
                  name: 'a',
                  type: 'uint256',
                },
                {
                  name: 'b',
                  type: 'string[]',
                },
              ],
              name: 'wagmiIn',
              type: 'tuple',
            },
          ],
          [
            {
              foo: {
                x: [1n, 2n, 3n, 4n],
                y: true,
                z: ['hello', 'world'],
              },
              a: 420n,
              b: ['wagmi', 'viem'],
            },
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000568656c6c6f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005776f726c6400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000057761676d6900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000047669656d00000000000000000000000000000000000000000000000000000000"',
      )
    })
  })

  describe('(((uint256[],bool,string[]))[],uint256,string[])', () => {
    test('default', () => {
      expect(
        // cast abi-encode "a((uint256[],bool,string[]),(((uint256[],bool,string),uint256,string[]),((uint256[],bool,string),uint256,string[]),uint256,string[]))" "([1,2,3,4],true,[hello, world])" "((([420,69],true,[nice,haha]),420,[wagmi,allday]),(([420,420],true,[this,is,a,param]),69420,[hello,there]),4204202,[lol,haha])"
        encodeAbiParameters(
          [
            {
              components: [
                {
                  name: 'x',
                  type: 'uint256[]',
                },
                {
                  name: 'y',
                  type: 'bool',
                },
                {
                  name: 'z',
                  type: 'string[]',
                },
              ],
              name: 'bazIn',
              type: 'tuple[]',
            },
            {
              components: [
                {
                  components: [
                    {
                      components: [
                        {
                          name: 'x',
                          type: 'uint256[]',
                        },
                        {
                          name: 'y',
                          type: 'bool',
                        },
                        {
                          name: 'z',
                          type: 'string[]',
                        },
                      ],
                      name: 'foo',
                      type: 'tuple',
                    },
                    {
                      name: 'a',
                      type: 'uint256',
                    },
                    {
                      name: 'b',
                      type: 'string[]',
                    },
                  ],
                  name: 'foo',
                  type: 'tuple',
                },
                {
                  components: [
                    {
                      components: [
                        {
                          name: 'x',
                          type: 'uint256[]',
                        },
                        {
                          name: 'y',
                          type: 'bool',
                        },
                        {
                          name: 'z',
                          type: 'string[]',
                        },
                      ],
                      name: 'foo',
                      type: 'tuple',
                    },
                    {
                      name: 'a',
                      type: 'uint256',
                    },
                    {
                      name: 'b',
                      type: 'string[]',
                    },
                  ],
                  name: 'bar',
                  type: 'tuple',
                },
                {
                  name: 'c',
                  type: 'uint256',
                },
                {
                  name: 'd',
                  type: 'string[]',
                },
              ],
              name: 'gmiIn',
              type: 'tuple',
            },
          ],
          [
            [
              {
                x: [1n, 2n, 3n, 4n],
                y: true,
                z: ['hello', 'world'],
              },
            ],
            {
              bar: {
                a: 69420n,
                b: ['hello', 'there'],
                foo: {
                  x: [420n, 420n],
                  y: true,
                  z: ['this', 'is', 'a', 'param'],
                },
              },
              c: 4204202n,
              d: ['lol', 'haha'],
              foo: {
                a: 420n,
                b: ['wagmi', 'allday'],
                foo: {
                  x: [420n, 69n],
                  y: true,
                  z: ['nice', 'haha'],
                },
              },
            },
          ],
        ),
      ).toMatchInlineSnapshot(
        '"0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000568656c6c6f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005776f726c640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000036000000000000000000000000000000000000000000000000000000000004026aa0000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000046e696365000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004686168610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000057761676d690000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006616c6c646179000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000010f2c00000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000004746869730000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000026973000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000161000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005706172616d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000568656c6c6f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005746865726500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036c6f6c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046861686100000000000000000000000000000000000000000000000000000000"',
      )
    })
  })
})

const orderComponents = [
  {
    conduitKey:
      '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
    consideration: [
      {
        endAmount: 420n,
        identifierOrCriteria: 69n,
        itemType: 10,
        recipient: address.vitalik,
        startAmount: 6n,
        token: address.burn,
      },
      {
        endAmount: 141n,
        identifierOrCriteria: 55n,
        itemType: 16,
        recipient: address.vitalik,
        startAmount: 15n,
        token: address.burn,
      },
    ],
    counter: 1234123123n,
    endTime: 123123123123n,
    offer: [
      {
        endAmount: 420n,
        identifierOrCriteria: 69n,
        itemType: 10,
        startAmount: 6n,
        token: address.burn,
      },
      {
        endAmount: 11n,
        identifierOrCriteria: 515n,
        itemType: 10,
        startAmount: 6n,
        token: address.usdcHolder,
      },
      {
        endAmount: 123123n,
        identifierOrCriteria: 55555511n,
        itemType: 10,
        startAmount: 111n,
        token: address.vitalik,
      },
    ],
    offerer: address.vitalik,
    orderType: 10,
    salt: 1234123123n,
    startTime: 123123123123n,
    zone: address.vitalik,
    zoneHash:
      '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
  },
  {
    conduitKey:
      '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
    consideration: [
      {
        endAmount: 420n,
        identifierOrCriteria: 69n,
        itemType: 10,
        recipient: address.vitalik,
        startAmount: 6n,
        token: address.burn,
      },
      {
        endAmount: 141n,
        identifierOrCriteria: 55n,
        itemType: 16,
        recipient: address.vitalik,
        startAmount: 15n,
        token: address.burn,
      },
    ],
    counter: 1234123123n,
    endTime: 123123123123n,
    offer: [
      {
        endAmount: 420n,
        identifierOrCriteria: 69n,
        itemType: 10,
        startAmount: 6n,
        token: address.burn,
      },
      {
        endAmount: 11n,
        identifierOrCriteria: 515n,
        itemType: 10,
        startAmount: 6n,
        token: address.usdcHolder,
      },
      {
        endAmount: 123123n,
        identifierOrCriteria: 55555511n,
        itemType: 10,
        startAmount: 111n,
        token: address.vitalik,
      },
    ],
    offerer: address.vitalik,
    orderType: 10,
    salt: 1234123123n,
    startTime: 123123123123n,
    zone: address.vitalik,
    zoneHash:
      '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
  },
] as const

describe('seaport', () => {
  test('cancel', () => {
    const cancel = getAbiItem({
      abi: seaportContractConfig.abi,
      name: 'cancel',
    })
    const data = encodeAbiParameters(cancel.inputs, [orderComponents])
    expect(data).toMatchInlineSnapshot(
      '"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000540000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000001caab5c3b30000000000000000000000000000000000000000000000000000001caab5c3b3511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a00000000000000000000000000000000000000000000000000000000498f3973511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a00000000000000000000000000000000000000000000000000000000498f39730000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c07800000000000000000000000000000000000000000000000000000000000002030000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000034fb5b7000000000000000000000000000000000000000000000000000000000000006f000000000000000000000000000000000000000000000000000000000001e0f30000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000008d000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000001caab5c3b30000000000000000000000000000000000000000000000000000001caab5c3b3511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a00000000000000000000000000000000000000000000000000000000498f3973511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a00000000000000000000000000000000000000000000000000000000498f39730000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c07800000000000000000000000000000000000000000000000000000000000002030000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000034fb5b7000000000000000000000000000000000000000000000000000000000000006f000000000000000000000000000000000000000000000000000000000001e0f30000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000008d000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045"',
    )
  })

  test('fulfillAdvancedOrder', () => {
    const {
      conduitKey,
      consideration,
      endTime,
      offer,
      offerer,
      orderType,
      salt,
      startTime,
      zone,
      zoneHash,
    } = orderComponents[0]

    const fulfillAdvancedOrder = getAbiItem({
      abi: seaportContractConfig.abi,
      name: 'fulfillAdvancedOrder',
    })
    const data = encodeAbiParameters(fulfillAdvancedOrder.inputs, [
      {
        denominator: 69n,
        extraData: '0x123123',
        numerator: 420n,
        parameters: {
          conduitKey,
          consideration,
          endTime,
          offer,
          offerer,
          orderType,
          salt,
          startTime,
          totalOriginalConsiderationItems: 69420n,
          zone,
          zoneHash,
        },
        signature: '0x123123',
      },
      [
        {
          criteriaProof: [
            '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
          ],
          identifier: 4242n,
          index: 1231n,
          orderIndex: 11n,
          side: 1,
        },
      ],
      '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
      address.vitalik,
    ])
    expect(data).toMatchInlineSnapshot(
      '"0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000006a0511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000005a000000000000000000000000000000000000000000000000000000000000005e0000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000001caab5c3b30000000000000000000000000000000000000000000000000000001caab5c3b3511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a00000000000000000000000000000000000000000000000000000000498f3973511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a0000000000000000000000000000000000000000000000000000000000010f2c0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c07800000000000000000000000000000000000000000000000000000000000002030000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000034fb5b7000000000000000000000000000000000000000000000000000000000000006f000000000000000000000000000000000000000000000000000000000001e0f30000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000008d000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000312312300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003123123000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000004cf000000000000000000000000000000000000000000000000000000000000109200000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a"',
    )
  })

  test('fulfillAvailableAdvancedOrders', () => {
    const {
      conduitKey,
      consideration,
      endTime,
      offer,
      offerer,
      orderType,
      salt,
      startTime,
      zone,
      zoneHash,
    } = orderComponents[0]

    const fulfillAdvancedOrder = getAbiItem({
      abi: seaportContractConfig.abi,
      name: 'fulfillAvailableAdvancedOrders',
    })
    const data = encodeAbiParameters(fulfillAdvancedOrder.inputs, [
      [
        {
          denominator: 24n,
          extraData: '0x123123',
          numerator: 41n,
          parameters: {
            conduitKey,
            consideration,
            endTime,
            offer,
            offerer,
            orderType,
            salt,
            startTime,
            totalOriginalConsiderationItems: 69420n,
            zone,
            zoneHash,
          },
          signature: '0x123123',
        },
      ],
      [
        {
          criteriaProof: [
            '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
          ],
          identifier: 12n,
          index: 1n,
          orderIndex: 1n,
          side: 1,
        },
      ],
      [[{ itemIndex: 1n, orderIndex: 1n }]],
      [[{ itemIndex: 1n, orderIndex: 2n }]],
      '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
      address.vitalik,
      10n,
    ])
    expect(data).toMatchInlineSnapshot(
      '"0x00000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000074000000000000000000000000000000000000000000000000000000000000008600000000000000000000000000000000000000000000000000000000000000900511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000029000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000005a000000000000000000000000000000000000000000000000000000000000005e0000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000001caab5c3b30000000000000000000000000000000000000000000000000000001caab5c3b3511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a00000000000000000000000000000000000000000000000000000000498f3973511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a0000000000000000000000000000000000000000000000000000000000010f2c0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c07800000000000000000000000000000000000000000000000000000000000002030000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000034fb5b7000000000000000000000000000000000000000000000000000000000000006f000000000000000000000000000000000000000000000000000000000001e0f30000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000008d000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000312312300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003123123000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001"',
    )
  })

  test('getCounter', () => {
    const getCounter = getAbiItem({
      abi: seaportContractConfig.abi,
      name: 'getCounter',
    })
    const data = encodeAbiParameters(getCounter.inputs, [address.vitalik])
    expect(data).toMatchInlineSnapshot(
      '"0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045"',
    )
  })

  test('fulfillAvailableAdvancedOrders', () => {
    const {
      conduitKey,
      consideration,
      endTime,
      offer,
      offerer,
      orderType,
      salt,
      startTime,
      zone,
      zoneHash,
    } = orderComponents[0]

    const fulfillAdvancedOrder = getAbiItem({
      abi: seaportContractConfig.abi,
      name: 'validate',
    })
    const data = encodeAbiParameters(fulfillAdvancedOrder.inputs, [
      [
        {
          parameters: {
            conduitKey,
            consideration,
            endTime,
            offer,
            offerer,
            orderType,
            salt,
            startTime,
            totalOriginalConsiderationItems: 2n,
            zone,
            zoneHash,
          },
          signature: '0x123123',
        },
      ],
    ])
    expect(data).toMatchInlineSnapshot(
      '"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000540000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000001caab5c3b30000000000000000000000000000000000000000000000000000001caab5c3b3511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a00000000000000000000000000000000000000000000000000000000498f3973511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c07800000000000000000000000000000000000000000000000000000000000002030000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000034fb5b7000000000000000000000000000000000000000000000000000000000000006f000000000000000000000000000000000000000000000000000000000001e0f30000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000008d000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000000031231230000000000000000000000000000000000000000000000000000000000"',
    )
  })
})

test('invalid type', () => {
  expect(() =>
    encodeAbiParameters([{ name: 'x', type: 'lol' }], [69]),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAbiEncodingType: Type "lol" is not a valid encoding type.
    Please provide a valid ABI type.

    Docs: https://viem.sh/docs/contract/encodeAbiParameters
    Version: viem@x.y.z]
  `)
})

test('invalid params/values lengths', () => {
  expect(() =>
    encodeAbiParameters(
      [{ name: 'x', type: 'uint256[3]' }],
      /* @ts-expect-error */
      [69, 420],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiEncodingLengthMismatchError: ABI encoding params/values length mismatch.
    Expected length (params): 1
    Given length (values): 2

    Version: viem@x.y.z]
  `)
})

test('invalid address', () => {
  expect(() =>
    encodeAbiParameters([{ name: 'x', type: 'address' }], ['0x111']),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0x111" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)
})

test('invalid array', () => {
  expect(() =>
    encodeAbiParameters(
      [{ name: 'x', type: 'uint256[3]' }],
      /* @ts-expect-error */
      [69],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidArrayError: Value "69" is not a valid array.

    Version: viem@x.y.z]
  `)
})

test('invalid array lengths', () => {
  expect(() =>
    encodeAbiParameters(
      [{ name: 'x', type: 'uint256[3]' }],
      /* @ts-expect-error */
      [[69n, 420n]],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiEncodingArrayLengthMismatchError: ABI encoding array length mismatch for type uint256[3].
    Expected length: 3
    Given length: 2

    Version: viem@x.y.z]
  `)
})

test('invalid bytes', () => {
  expect(() =>
    encodeAbiParameters([{ name: 'x', type: 'bytes8' }], ['0x111']),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiEncodingBytesSizeMismatchError: Size of bytes "0x111" (bytes2) does not match expected size (bytes8).

    Version: viem@x.y.z]
  `)
})

test('integer out of range', () => {
  expect(() =>
    encodeAbiParameters(
      [
        {
          type: 'uint128',
        },
        {
          type: 'int128',
        },
        {
          type: 'int128',
        },
        {
          type: 'uint',
        },
        {
          type: 'int',
        },
        {
          type: 'int',
        },
      ],
      [maxUint128, maxInt128, minInt128, maxUint256, maxInt256, minInt256],
    ),
  ).not.toThrow()

  expect(() =>
    encodeAbiParameters(
      [
        {
          type: 'uint128',
        },
      ],
      [maxUint128 + 1n],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [IntegerOutOfRangeError: Number "340282366920938463463374607431768211456" is not in safe 128-bit unsigned integer range (0 to 340282366920938463463374607431768211455)

    Version: viem@x.y.z]
  `)

  expect(() =>
    encodeAbiParameters(
      [
        {
          type: 'uint128',
        },
      ],
      [-1n],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [IntegerOutOfRangeError: Number "-1" is not in safe 128-bit unsigned integer range (0 to 340282366920938463463374607431768211455)

    Version: viem@x.y.z]
  `)

  expect(() =>
    encodeAbiParameters(
      [
        {
          type: 'int128',
        },
      ],
      [maxInt128 + 1n],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [IntegerOutOfRangeError: Number "170141183460469231731687303715884105728" is not in safe 128-bit signed integer range (-170141183460469231731687303715884105728 to 170141183460469231731687303715884105727)

    Version: viem@x.y.z]
  `)

  expect(() =>
    encodeAbiParameters(
      [
        {
          type: 'int128',
        },
      ],
      [minInt128 - 1n],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [IntegerOutOfRangeError: Number "-170141183460469231731687303715884105729" is not in safe 128-bit signed integer range (-170141183460469231731687303715884105728 to 170141183460469231731687303715884105727)

    Version: viem@x.y.z]
  `)

  expect(() =>
    encodeAbiParameters(
      [
        {
          type: 'uint',
        },
      ],
      [maxUint256 + 1n],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [IntegerOutOfRangeError: Number "115792089237316195423570985008687907853269984665640564039457584007913129639936" is not in safe 256-bit unsigned integer range (0 to 115792089237316195423570985008687907853269984665640564039457584007913129639935)

    Version: viem@x.y.z]
  `)

  expect(() =>
    encodeAbiParameters(
      [
        {
          type: 'uint',
        },
      ],
      [-1n],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [IntegerOutOfRangeError: Number "-1" is not in safe 256-bit unsigned integer range (0 to 115792089237316195423570985008687907853269984665640564039457584007913129639935)

    Version: viem@x.y.z]
  `)
})

test('getArrayComponents', () => {
  expect(getArrayComponents('uint256[2]')).toEqual([2, 'uint256'])
  expect(getArrayComponents('uint256[2][3]')).toEqual([3, 'uint256[2]'])
  expect(getArrayComponents('uint256[][3]')).toEqual([3, 'uint256[]'])
  expect(getArrayComponents('uint256[]')).toEqual([null, 'uint256'])
  expect(getArrayComponents('uint256[][]')).toEqual([null, 'uint256[]'])
  expect(getArrayComponents('uint256')).toBeUndefined()
})

test('https://github.com/wevm/viem/issues/1960', () => {
  expect(() =>
    encodeAbiParameters(
      [
        {
          name: 'boolz',
          type: 'bool[]',
        },
      ] as const,
      // @ts-expect-error
      [['true']],
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BaseError: Invalid boolean value: "true" (type: string). Expected: \`true\` or \`false\`.

    Version: viem@x.y.z]
  `)
})
