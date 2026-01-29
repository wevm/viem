import { expect, test } from 'vitest'

import { address } from '~test/src/constants.js'

import { encodePacked } from './encodePacked.js'

test.each([
  {
    types: [],
    values: [],
    expected: '0x',
  },
  {
    types: ['address'],
    values: [address.vitalik],
    expected: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  },
  {
    types: ['string'],
    values: ['hello world'],
    expected: '0x68656c6c6f20776f726c64',
  },
  {
    types: ['bytes'],
    values: ['0xdeadbeef'],
    expected: '0xdeadbeef',
  },
  {
    types: ['bool'],
    values: [true],
    expected: '0x01',
  },
  {
    types: ['uint'],
    values: [69420n],
    expected:
      '0x0000000000000000000000000000000000000000000000000000000000010f2c',
  },
  {
    types: ['uint8'],
    values: [200],
    expected: '0xc8',
  },
  {
    types: ['uint48'],
    values: [20123120],
    expected: '0x000001330df0',
  },
  {
    types: ['uint128'],
    values: [20123120n],
    expected: '0x00000000000000000000000001330df0',
  },
  {
    types: ['int'],
    values: [69420n],
    expected:
      '0x0000000000000000000000000000000000000000000000000000000000010f2c',
  },
  {
    types: ['int'],
    values: [-69420n],
    expected:
      '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffef0d4',
  },
  {
    types: ['int8'],
    values: [121],
    expected: '0x79',
  },
  {
    types: ['int8'],
    values: [-121],
    expected: '0x87',
  },
  {
    types: ['int48'],
    values: [121231],
    expected: '0x00000001d98f',
  },
  {
    types: ['int48'],
    values: [-1212311],
    expected: '0xffffffed8069',
  },
  {
    types: ['int128'],
    values: [12312312],
    expected: '0x00000000000000000000000000bbdef8',
  },
  {
    types: ['int128'],
    values: [-121231231211],
    expected: '0xffffffffffffffffffffffe3c60e3715',
  },
  {
    types: ['bytes'],
    values: ['0xdeadbeef'],
    expected: '0xdeadbeef',
  },
  {
    types: ['bytes4'],
    values: ['0xdeadbeef'],
    expected: '0xdeadbeef',
  },
  {
    types: ['bytes8'],
    values: ['0xdeadeefdeaadbeef'],
    expected: '0xdeadeefdeaadbeef',
  },
  {
    types: ['bytes16'],
    values: ['0xdeadeefdeaadbeefdeadeefdeaadbeef'],
    expected: '0xdeadeefdeaadbeefdeadeefdeaadbeef',
  },
  {
    types: ['address[]'],
    values: [[address.vitalik, address.usdcHolder]],
    expected:
      '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c078',
  },
  {
    types: ['address[2]'],
    values: [[address.vitalik, address.usdcHolder]],
    expected:
      '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c078',
  },
  {
    types: ['address[][]'],
    values: [[[address.vitalik, address.usdcHolder], [address.burn]]],
    expected:
      '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000005414d89a8bf7e99d732bc52f3e6a3ef461c0c0780000000000000000000000000000000000000000000000000000000000000000',
  },
  {
    types: ['string[]'],
    values: [['hello', 'world']],
    expected: '0x68656c6c6f776f726c64',
  },
  {
    types: ['string[][]'],
    values: [[['hello', 'world'], ['lol']]],
    expected: '0x68656c6c6f776f726c646c6f6c',
  },
  {
    types: ['bytes[]'],
    values: [['0xdead', '0xbeef']],
    expected: '0xdeadbeef',
  },
  {
    types: ['bytes[]'],
    values: [['0x', '0xbeef']],
    expected: '0xbeef',
  },
  {
    types: ['bytes[]'],
    values: [[]],
    expected: '0x',
  },
  {
    types: ['bool[]'],
    values: [[true, false, true]],
    expected:
      '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  },
  {
    types: ['uint[]'],
    values: [[69420n, 42069n]],
    expected:
      '0x0000000000000000000000000000000000000000000000000000000000010f2c000000000000000000000000000000000000000000000000000000000000a455',
  },
  {
    types: ['uint8[]'],
    values: [[200, 201]],
    expected:
      '0x00000000000000000000000000000000000000000000000000000000000000c800000000000000000000000000000000000000000000000000000000000000c9',
  },
  {
    types: ['int[]'],
    values: [[20123120n, 20123121n]],
    expected:
      '0x0000000000000000000000000000000000000000000000000000000001330df00000000000000000000000000000000000000000000000000000000001330df1',
  },
  {
    types: ['bytes4[]'],
    values: [['0xdeadbeef', '0xcafebabe']],
    expected:
      '0xdeadbeef00000000000000000000000000000000000000000000000000000000cafebabe00000000000000000000000000000000000000000000000000000000',
  },
  {
    types: ['bytes16[]'],
    values: [
      [
        '0xdeadbeefdeadbeefdeadbeefdeadbeef',
        '0xcafebabecafebabecafebabecafebabe',
      ],
    ],
    expected:
      '0xdeadbeefdeadbeefdeadbeefdeadbeef00000000000000000000000000000000cafebabecafebabecafebabecafebabe00000000000000000000000000000000',
  },
  {
    types: ['address', 'string'],
    values: [address.vitalik, 'hello world'],
    expected:
      '0xd8da6bf26964af9d7eed9e03e53415d37aa9604568656c6c6f20776f726c64',
  },
  {
    types: ['address', 'string', 'bytes4[]'],
    values: [address.vitalik, 'hello world', ['0xdeadbeef', '0xcafebabe']],
    expected:
      '0xd8da6bf26964af9d7eed9e03e53415d37aa9604568656c6c6f20776f726c64deadbeef00000000000000000000000000000000000000000000000000000000cafebabe00000000000000000000000000000000000000000000000000000000',
  },
])(
  "encodePacked($types, $values) -> '$expected'",
  ({ types, values, expected }) => {
    expect(encodePacked(types, values)).toBe(expected)
  },
)

test('error: invalid address', () => {
  expect(() =>
    encodePacked(['address'], ['0xdeadbeef']),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0xdeadbeef" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)
})

test('error: length mismatch', () => {
  expect(
    // @ts-expect-error
    () => encodePacked(['address'], [address.vitalik, '0x']),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiEncodingLengthMismatchError: ABI encoding params/values length mismatch.
    Expected length (params): 1
    Given length (values): 2

    Version: viem@x.y.z]
  `)
})

test('error: bytes size mismatch', () => {
  expect(() =>
    encodePacked(['bytes8'], ['0xdeadbeef']),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BytesSizeMismatchError: Expected bytes8, got bytes4.

    Version: viem@x.y.z]
  `)
})

test('error: unsupported type', () => {
  expect(
    // @ts-expect-error
    () => encodePacked(['function'], ['0x']),
  ).toThrowErrorMatchingInlineSnapshot(`
    [UnsupportedPackedAbiType: Type "function" is not supported for packed encoding.

    Version: viem@x.y.z]
  `)
})
