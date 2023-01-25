import { describe, expect, test } from 'vitest'

import {
  Abi,
  AbiFunction,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype'

import { mixedAbi } from '../../../test'
import { decodeAbi } from './decodeAbi'

export function extractFunction<
  TAbi extends Abi,
  TName extends ExtractAbiFunctionNames<TAbi>,
>({
  abi,
  name,
}: {
  abi: TAbi
  name: TName
}): ExtractAbiFunction<TAbi, TName> {
  return (abi.find(
    (abi) => abi.type === 'function' && abi.name === name,
  ) as AbiFunction & {
    type: 'function'
  })! as ExtractAbiFunction<TAbi, TName>
}

describe('static', () => {
  test('uint', () => {
    expect(
      decodeAbi({
        data: '0x0000000000000000000000000000000000000000000000000000000000010f2c',
        params: extractFunction({
          abi: mixedAbi,
          name: 'staticUint',
        }).inputs,
      }),
    ).toEqual([69420n])
  })

  test('uint8', () => {
    expect(
      decodeAbi({
        data: '0x0000000000000000000000000000000000000000000000000000000000000020',
        params: [
          {
            internalType: 'uint8',
            name: 'foo',
            type: 'uint8',
          },
        ],
      }),
    ).toEqual([32])
  })

  test('uint32', () => {
    expect(
      decodeAbi({
        data: '0x0000000000000000000000000000000000000000000000000000000000010f2c',
        params: [
          {
            internalType: 'uint32',
            name: 'foo',
            type: 'uint32',
          },
        ],
      }),
    ).toEqual([69420])
  })

  describe('int', () => {
    test('default', () => {
      expect(
        decodeAbi({
          data: '0x0000000000000000000000000000000000000000000000000000000000010f2c',
          params: [
            {
              internalType: 'int',
              name: 'foo',
              type: 'int',
            },
          ],
        }),
      ).toEqual([69420n])
    })

    test('negative (twos compliment)', () => {
      expect(
        decodeAbi({
          data: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffef0d4',
          params: [
            {
              internalType: 'int',
              name: 'foo',
              type: 'int',
            },
          ],
        }),
      ).toEqual([-69420n])
    })
  })

  describe('int8', () => {
    test('default', () => {
      expect(
        decodeAbi({
          data: '0x000000000000000000000000000000000000000000000000000000000000007f',
          params: [
            {
              internalType: 'int8',
              name: 'foo',
              type: 'int8',
            },
          ],
        }),
      ).toEqual([127])
    })

    test('negative (twos compliment)', () => {
      expect(
        decodeAbi({
          data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80',
          params: [
            {
              internalType: 'int8',
              name: 'foo',
              type: 'int8',
            },
          ],
        }),
      ).toEqual([-128])
    })
  })

  describe('int32', () => {
    test('default', () => {
      expect(
        decodeAbi({
          data: '0x000000000000000000000000000000000000000000000000000000007fffffff',
          params: [
            {
              internalType: 'int32',
              name: 'foo',
              type: 'int32',
            },
          ],
        }),
      ).toEqual([2147483647])
    })

    test('negative (twos compliment)', () => {
      expect(
        decodeAbi({
          data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff80000000',
          params: [
            {
              internalType: 'int32',
              name: 'foo',
              type: 'int32',
            },
          ],
        }),
      ).toEqual([-2147483648])
    })
  })

  describe('address', () => {
    test('default', () => {
      expect(
        decodeAbi({
          data: '0x00000000000000000000000014dc79964da2c08b23698b3d3cc7ca32193d9955',
          params: [
            {
              internalType: 'address',
              name: 'foo',
              type: 'address',
            },
          ],
        }),
      ).toEqual(['0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'])
    })
  })

  describe('uint[3]', () => {
    test('default', () => {
      expect(
        decodeAbi({
          data: '0x0000000000000000000000000000000000000000000000000000000000010f2c000000000000000000000000000000000000000000000000000000000000a45500000000000000000000000000000000000000000000000000000000190f1b44',
          params: extractFunction({
            abi: mixedAbi,
            name: 'staticUintArray',
          }).inputs,
        }),
      ).toEqual([[69420n, 42069n, 420420420n]])
    })
  })
})

describe('dynamic', () => {
  describe('(uint256[][2])', () => {
    test('default', () => {
      expect(
        decodeAbi({
          params: [
            {
              internalType: 'uint256[][2]',
              name: 'test',
              type: 'uint256[][2]',
            },
          ],
          data: '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001',
        }),
      ).toEqual([
        [
          [1n, 2n, 3n, 4n],
          [3n, 2n, 1n],
        ],
      ])
    })
  })

  describe('(uint[])', () => {
    test('default', () => {
      expect(
        decodeAbi({
          params: extractFunction({
            abi: mixedAbi,
            name: 'dynamicUintArray',
          }).inputs,
          data: '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000037',
        }),
      ).toEqual([[420n, 69n, 22n, 55n]])
    })
  })

  describe('(uint[][])', () => {
    test('default', () => {
      expect(
        decodeAbi({
          params: extractFunction({
            abi: mixedAbi,
            name: 'dynamicUintNestedArray',
          }).inputs,
          data: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000045',
        }),
      ).toEqual([[[420n, 69n]]])
    })

    test('complex', () => {
      expect(
        // cast abi-encode "a(uint[][])" "[[420,69],[22,55,22],[51,52,66,11]]"
        decodeAbi({
          params: extractFunction({
            abi: mixedAbi,
            name: 'dynamicUintNestedArray',
          }).inputs,
          data: '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000003700000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000003300000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000000b',
        }),
      ).toEqual([
        [
          [420n, 69n],
          [22n, 55n, 22n],
          [51n, 52n, 66n, 11n],
        ],
      ])
    })
  })
})
